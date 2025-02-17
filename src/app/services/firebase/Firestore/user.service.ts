import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, getDocs, getDoc, setDoc, deleteDoc, doc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private injector = inject(Injector);
  private firestore = inject(Firestore);
  private userHelper = new UserHelper(this.firestore, this.injector);

  async storeUser(userId: string, userData: Record<string, any>): Promise<Record<string, any> | null> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      await setDoc(userRef, userData, { merge: true });

      // Ensure default categories are initialized on first-time sign-up
      await this.userHelper.initializeDefaultCategories(userId);

      const storedUser = await getDoc(userRef);
      return storedUser.exists() ? { uid: userId, ...storedUser.data() } : null;
    } catch (error) {
      console.error('Error storing user in Firestore:', error);
      return null;
    }
  }

  async getUserInfo(userId: string): Promise<{ email: string; name: string } | null> {
    if (!userId) return null;

    return runInInjectionContext(this.injector, async () => {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return null;

      const data = userSnap.data();
      return { email: data['email'] ?? '', name: data['name'] ?? 'User' };
    });
  }

  async getUserCurrency(userId: string): Promise<{ abbreviation: string; symbol: string }> {
    if (!userId) return { abbreviation: 'USD', symbol: '$' }; 

    return runInInjectionContext(this.injector, async () => {
      const currencyRef = doc(this.firestore, `currency/${userId}`);
      const currencySnap = await getDoc(currencyRef);
      if (currencySnap.exists()) {
        return {
          abbreviation: currencySnap.data()['abbreviation'] ?? 'USD',
          symbol: currencySnap.data()['symbol'] ?? '$'
        };
      } else {
        return { abbreviation: 'USD', symbol: '$' };
      }
    });
  }

  async updateUserCurrency(userId: string, abbreviation: string, symbol: string): Promise<void> {
    if (!userId) return;

    return runInInjectionContext(this.injector, async () => {
      const currencyRef = doc(this.firestore, `currency/${userId}`);
      await setDoc(currencyRef, { 
        abbreviation,
        symbol,
      }, { merge: true });
    });
  }

  async getUserCategories(userId: string): Promise<string[]> {
    return this.userHelper.getUserCategories(userId);
  }

  async addUserCategory(userId: string, category: string): Promise<void> {
    return this.userHelper.addUserCategory(userId, category);
  }

  async deleteUserCategory(userId: string, category: string): Promise<void> {
    if (!userId || !category.trim()) return;
  
    return runInInjectionContext(this.injector, async () => {
      const categoryRef = doc(this.firestore, `categories/${userId}/list`, category);
      await deleteDoc(categoryRef);
    });
  }
}

// Helper class for utility functions related to user data
class UserHelper {
  private firestore: Firestore;
  private injector: Injector;

  constructor(firestore: Firestore, injector: Injector) {
    this.firestore = firestore;
    this.injector = injector;
  }

  async initializeDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = ['Transport', 'Groceries', 'Bill', 'Entertainment', 'Meal', 'Travel'];

    return runInInjectionContext(this.injector, async () => {
      const categoriesRef = collection(this.firestore, `categories/${userId}/list`);
      
      for (const category of defaultCategories) {
        await setDoc(doc(categoriesRef, category), { name: category }, { merge: true });
      }
    });
  }

  async getUserCategories(userId: string): Promise<string[]> {
    if (!userId) return ['Transport', 'Groceries', 'Bill', 'Entertainment', 'Meal', 'Travel'];

    return runInInjectionContext(this.injector, async () => {
      const categoriesRef = collection(this.firestore, `categories/${userId}/list`);
      const categoryDocs = await getDocs(categoriesRef);
      return categoryDocs.docs.map(doc => doc.data()['name'] as string);
    });
  }

  async addUserCategory(userId: string, category: string): Promise<void> {
    if (!userId) return;

    return runInInjectionContext(this.injector, async () => {
      const categoriesRef = collection(this.firestore, `categories/${userId}/list`);
      await setDoc(doc(categoriesRef, category), { name: category });
    });
  }
}
