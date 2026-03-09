// Net Worth Calculator JavaScript

class NetWorthCalculator {
    constructor() {
        this.initializeEventListeners();
        this.updateCalculations();
    }

    initializeEventListeners() {
        // Net worth calculation inputs
        const netWorthInputs = [
            'cash', 'investments', 'retirement', 'realestate', 'otherassets',
            'debts', 'mortgage', 'creditcards', 'loans'
        ];

        netWorthInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateNetWorth());
            }
        });

        // Projection inputs
        const projectionInputs = ['monthlyInvestment', 'annualReturn'];
        projectionInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateProjections());
            }
        });

        // Habit analyzer inputs
        const habitInputs = ['habitCost', 'habitFrequency'];
        habitInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateHabitAnalysis());
                element.addEventListener('change', () => this.updateHabitAnalysis());
            }
        });
    }

    updateCalculations() {
        this.updateNetWorth();
        this.updateProjections();
        this.updateHabitAnalysis();
    }

    getInputValue(id) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) || 0 : 0;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
    }

    updateNetWorth() {
        // Calculate total assets
        const totalAssets = 
            this.getInputValue('cash') +
            this.getInputValue('investments') +
            this.getInputValue('retirement') +
            this.getInputValue('realestate') +
            this.getInputValue('otherassets');

        // Calculate total liabilities
        const totalLiabilities = 
            this.getInputValue('debts') +
            this.getInputValue('mortgage') +
            this.getInputValue('creditcards') +
            this.getInputValue('loans');

        // Calculate net worth
        const netWorth = totalAssets - totalLiabilities;

        // Update display
        document.getElementById('totalAssets').textContent = this.formatCurrency(totalAssets);
        document.getElementById('totalLiabilities').textContent = this.formatCurrency(totalLiabilities);
        
        const netWorthElement = document.getElementById('netWorth');
        netWorthElement.textContent = this.formatCurrency(netWorth);
        
        // Update color based on positive/negative
        const netWorthMetric = netWorthElement.closest('.metric');
        if (netWorth < 0) {
            netWorthMetric.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            netWorthMetric.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
        }

        // Update projections when net worth changes
        this.updateProjections();
    }

    calculateCompoundGrowth(principal, monthlyContribution, annualRate, years) {
        const monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;
        
        // Future value of existing principal
        const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, totalMonths);
        
        // Future value of monthly contributions (annuity)
        const futureValueContributions = monthlyContribution * 
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
        
        return futureValuePrincipal + futureValueContributions;
    }

    updateProjections() {
        const currentNetWorth = this.getCurrentNetWorth();
        const monthlyInvestment = this.getInputValue('monthlyInvestment');
        const annualReturn = this.getInputValue('annualReturn');

        const projections = [10, 20, 30, 50];
        
        projections.forEach(years => {
            const futureValue = this.calculateCompoundGrowth(
                currentNetWorth,
                monthlyInvestment,
                annualReturn,
                years
            );
            
            const element = document.getElementById(`projection${years}`);
            if (element) {
                element.textContent = this.formatCurrency(futureValue);
            }
        });
    }

    getCurrentNetWorth() {
        const totalAssets = 
            this.getInputValue('cash') +
            this.getInputValue('investments') +
            this.getInputValue('retirement') +
            this.getInputValue('realestate') +
            this.getInputValue('otherassets');

        const totalLiabilities = 
            this.getInputValue('debts') +
            this.getInputValue('mortgage') +
            this.getInputValue('creditcards') +
            this.getInputValue('loans');

        return Math.max(0, totalAssets - totalLiabilities); // Use 0 if negative net worth
    }

    updateHabitAnalysis() {
        const habitCost = this.getInputValue('habitCost');
        const frequency = document.getElementById('habitFrequency').value;
        const annualReturn = this.getInputValue('annualReturn');

        if (habitCost === 0) {
            this.clearHabitDisplay();
            return;
        }

        // Calculate yearly habit cost based on frequency
        let yearlyCost;
        switch (frequency) {
            case 'daily':
                yearlyCost = habitCost * 365;
                break;
            case 'weekly':
                yearlyCost = habitCost * 52;
                break;
            case 'monthly':
                yearlyCost = habitCost * 12;
                break;
            default:
                yearlyCost = 0;
        }

        // Calculate cost of habit over time
        const habitCosts = {
            1: yearlyCost,
            10: yearlyCost * 10,
            30: yearlyCost * 30
        };

        // Calculate investment value if money was invested instead
        const monthlyHabitCost = yearlyCost / 12;
        const investmentValues = {
            1: this.calculateCompoundGrowth(0, monthlyHabitCost, annualReturn, 1),
            10: this.calculateCompoundGrowth(0, monthlyHabitCost, annualReturn, 10),
            30: this.calculateCompoundGrowth(0, monthlyHabitCost, annualReturn, 30)
        };

        // Update display
        Object.keys(habitCosts).forEach(years => {
            const costElement = document.getElementById(`habitCost${years}Year${years > 1 ? 's' : ''}`);
            const investmentElement = document.getElementById(`habitInvestment${years}Year${years > 1 ? 's' : ''}`);
            
            if (costElement) {
                costElement.textContent = this.formatCurrency(habitCosts[years]);
            }
            if (investmentElement) {
                investmentElement.textContent = this.formatCurrency(investmentValues[years]);
            }
        });

        // Calculate and display opportunity cost
        const opportunityCost = investmentValues[30] - habitCosts[30];
        const opportunityElement = document.getElementById('opportunityCost');
        if (opportunityElement) {
            opportunityElement.textContent = this.formatCurrency(opportunityCost);
        }
    }

    clearHabitDisplay() {
        const elements = [
            'habitCost1Year', 'habitCost10Years', 'habitCost30Years',
            'habitInvestment1Year', 'habitInvestment10Years', 'habitInvestment30Years',
            'opportunityCost'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '$0';
            }
        });
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NetWorthCalculator();
});

// Add some visual feedback for form interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add focus effects to input groups
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // Add hover effects to metric cards
    const metrics = document.querySelectorAll('.metric');
    metrics.forEach(metric => {
        metric.addEventListener('mouseenter', () => {
            if (!metric.classList.contains('primary')) {
                metric.style.transform = 'translateY(-2px)';
                metric.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            }
        });
        
        metric.addEventListener('mouseleave', () => {
            if (!metric.classList.contains('primary')) {
                metric.style.transform = 'translateY(0)';
                metric.style.boxShadow = 'none';
            }
        });
    });

    // Add animation when values change
    const observeValueChanges = (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            const observer = new MutationObserver(() => {
                element.style.animation = 'none';
                element.offsetHeight; // Trigger reflow
                element.style.animation = 'pulse 0.3s ease-in-out';
            });
            
            observer.observe(element, { childList: true, characterData: true, subtree: true });
        }
    };

    // Apply value change animations to key elements
    ['netWorth', 'totalAssets', 'totalLiabilities'].forEach(observeValueChanges);
});

// Add CSS animation for pulse effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);