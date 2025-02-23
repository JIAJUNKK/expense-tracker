export class CategoryUtils{
    static getExpenseColor(type: string): string {
        const colorMap: { [key: string]: string } = {
        Transport: '#D4F8C9',
        Groceries: '#FFD3B4',
        Bill: '#FFB3B3',
        Entertainment: '#E5D3FF',
        Meal: '#A3C4BC',
        Travel: '#F9D5E5'
        };
        return colorMap[type] || '#E0E0E0';
    }
      
    static getExpenseIcon(type: string): string {
        const iconMap: { [key: string]: string } = {
        Transport: 'fas fa-bus',
        Groceries: 'fas fa-shopping-cart',
        Bill: 'fas fa-file-invoice',
        Entertainment: 'fas fa-music',
        Meal: 'fas fa-utensils',
        Travel: 'fas fa-plane'
        };
        return iconMap[type] || 'fas fa-question-circle';
    } 
}