import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomExpenseService {
  private apiUrl = 'http://localhost:8081/api/expenses';
  private invoices: any[] = []; // Local storage for invoices

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addExpense(expense: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, expense);
  }
  getExpensesByMonth(month: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?month=${month}`);
  }
  storeInvoice(invoice: any): void {
    this.invoices.push(invoice);
  }

  getInvoices(): Observable<any[]> {
    return of(this.invoices);
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
