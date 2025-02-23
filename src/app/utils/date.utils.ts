import { Timestamp } from "firebase/firestore";

export class DateUtils {
    static convertTimestampToDate(timestamp: Timestamp | null): string {
      if (!timestamp) return '';
      return timestamp.toDate().toISOString().split('T')[0];
    }
  
    static convertDateToTimestamp(dateString: string): Timestamp {
      return Timestamp.fromDate(new Date(dateString));
    }
  }
  