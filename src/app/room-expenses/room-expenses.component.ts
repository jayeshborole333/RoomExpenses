import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { RoomExpenseService } from '../service/roomexpense.service';
import { RoomFellowService } from '../service/roomfellow.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RoomExpense } from '../model/roomexpense.model';
import { CommonModule } from '@angular/common';
import { Roomfellow } from '../model/roomfellow.model';

@Component({
  selector: 'app-room-expenses',
  templateUrl: './room-expenses.component.html',
  styleUrls: ['./room-expenses.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class RoomExpensesComponent implements OnInit {
  roomExpenseForm!: FormGroup;
  roomFellows: Roomfellow[] = [];
  selectedMonth: string = new Date().toISOString().slice(0, 7);
  billingPeriod: string = '';
  expenses: RoomExpense[] = [];
  apiUrl = 'http://localhost:8081/api/expenses';
  roomExpenseFrom: FormGroup | null = null;
  
  constructor(
    private fb: FormBuilder,
    private roomExpenseService: RoomExpenseService,
    private roomFellowService: RoomFellowService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.fetchRoomFellows();
    this.fetchExpenses();
    this.setBillingPeriod();
  }

  initializeForm() {
    this.roomExpenseForm = this.fb.group({
      roomRent: ['', Validators.required],
      vegetable: ['', Validators.required],
      d_mart: ['', Validators.required],
      wifi: ['', Validators.required],
      electricityBill: ['', Validators.required],
      gas: ['', Validators.required],
    });

    console.log("✅ Form Initialized:", this.roomExpenseForm.value);
  }
  

  fetchRoomFellows() {
    this.roomFellowService.getRoomFellows().subscribe({
      next: (roomfellows: any[]) => {
        this.roomFellows = roomfellows;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error fetching room fellows:', error);
      }
    });
  }

  fetchExpenses() {
    console.log("🔍 Selected Month Before Fetch:", this.selectedMonth);
  
    this.http.get<RoomExpense[]>(`${this.apiUrl}/all`).subscribe({
      next: (data) => {
        console.log("✅ Fetched Expenses:", data);
  
        // Sorting expenses by original ID
        data.sort((a, b) => a.id - b.id);
  
        // ✅ Filtering expenses by selected month
        const filteredExpenses = data.filter(expense => {
          const expenseMonth = expense.month ? expense.month.trim() : "";
          console.log(`📌 Checking Expense: ${expenseMonth} === ${this.selectedMonth}`);
          return expenseMonth === this.selectedMonth;
        });
  
        console.log("🎯 Filtered Expenses:", filteredExpenses);
  
        // Assigning new sequential IDs
        this.expenses = filteredExpenses.map((expense, index) => {
          const newId = index + 1;
  
          if (!expense.month) {
            console.warn(`⚠️ Expense with ID ${expense.id} has an undefined month.`);
            return { ...expense, displayId: newId, actualId: expense.id, month: "Unknown Month" };
          }
  
          if (!expense.month.includes('-')) {
            console.error(`❌ Invalid month format for ID ${expense.id}: ${expense.month}`);
            return { ...expense, displayId: newId, actualId: expense.id, month: `Invalid Format (${expense.month})` };
          }
  
          const [year, month] = expense.month.split('-');
          const monthIndex = parseInt(month, 10) - 1;
  
          if (monthIndex < 0 || monthIndex > 11 || isNaN(monthIndex)) {
            console.error(`❌ Invalid month index for ID ${expense.id}: ${monthIndex}`);
            return { ...expense, displayId: newId, actualId: expense.id, month: `Invalid Month (${expense.month})` };
          }
  
          return {
            ...expense,
            displayId: newId,
            actualId: expense.id,
            month: `${this.monthsList[monthIndex].name} ${year}`
          };
        });
  
        console.log("📝 Final Expenses List with displayId:", this.expenses);
      },
      error: (error) => {
        console.error("❌ Error fetching expenses:", error);
      }
    });
  }
  
  setBillingPeriod() {
    if (!this.selectedMonth) {
      console.warn("⚠️ No selected month available.");
      return;
    }
  
    const [year, month] = this.selectedMonth.split('-');
    const monthIndex = parseInt(month, 10) - 1;
  
    if (monthIndex < 0 || monthIndex > 11 || isNaN(monthIndex)) {
      console.error("❌ Invalid month selection:", this.selectedMonth);
      this.billingPeriod = "Invalid Month";
      return;
    }
  
    this.billingPeriod = `${this.monthsList[monthIndex].name} ${year}`;
    console.log("📅 Billing Period Set:", this.billingPeriod);
  }  

  monthsList = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" }
  ];
  
  onMonthChange() {
    console.log("📌 User Selected Month:", this.selectedMonth);
    this.fetchExpenses();
  }
  
  setCurrentMonth() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
    this.selectedMonth = `${year}-${month}`;
    
    console.log("📌 Current Month Set To:", this.selectedMonth);
  
   
    this.fetchExpenses();
  }

  onBillingPeriodChange(event: any) {
    this.billingPeriod = event.target.value;
  }

  onSubmit() {
    if (this.roomExpenseForm.valid) {
      const newExpense: RoomExpense = { 
        ...this.roomExpenseForm.value, 
        month: this.selectedMonth,
        date: new Date().toISOString().slice(0, 10)
      };
  
      console.log("🚀 Submitting Expense:", newExpense);
  
      this.roomExpenseService.addExpense(newExpense).subscribe({
        next: (response) => {
          console.log("✅ Expense Added Successfully:", response);
          alert('Expense added successfully!');
          this.fetchExpenses();
          this.roomExpenseForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          console.error('❌ Error adding expense:', error);
          alert('Failed to add expense!');
        }
      });
    } else {
      console.warn("⚠️ Form is invalid:", this.roomExpenseForm.value);
    }
  }
  
  deleteRoomExpense(actualId: number) {
    console.log(`📌 Trying to delete ID: ${actualId}`);
  
    if (!confirm(`Are you sure you want to delete expense ID ${actualId}?`)) return;
  
    this.http.delete(`${this.apiUrl}/${actualId}`).subscribe({
      next: () => {
        console.log(`✅ Expense with ID ${actualId} deleted successfully.`);
  
        this.fetchExpenses();
      },
      error: (error) => {
        console.error(`❌ Error deleting expense with ID ${actualId}:`, error);
        alert("Failed to delete expense!");
      }
    });
  }
  
  sendInvoiceViaEmail(file: Blob) {
    const roomFellowsEmails = this.roomFellows.map(fellow => fellow.email);

    // Check if emails are being collected correctly
    console.log('Emails to send:', roomFellowsEmails);

    const formData = new FormData();
    formData.append('invoice', file, 'Room_Expense_Invoice.pdf');
    formData.append('recipients', roomFellowsEmails.join(', '));

    this.http.post('http://localhost:8081/api/expenses/sendInvoiceEmail', formData).subscribe({
      next: (response) => {
        console.log('✅ Email sent successfully!');
        alert('Invoice sent successfully to all room fellows!');
      },
      error: (error) => {
        console.error('❌ Error sending email:', error);
        alert('Failed to send the invoice email.');
      }
    });
  }

  getTotal(): number {
    return this.expenses.reduce((total, expense) => 
      total + (expense.roomRent || 0) + 
      (expense.vegetable || 0) + 
      (expense.d_mart || 0) + 
      (expense.wifi || 0) + 
      (expense.electricityBill || 0) + 
      (expense.gas || 0), 0);
  }

  generateInvoice(expenseId: number) {
    this.fetchExpenses();

    setTimeout(() => {
        if (!this.expenses || this.expenses.length === 0) {
            alert('No expenses available to generate an invoice.');
            return;
        }

        const selectedExpense = this.expenses.find(expense => expense.id === expenseId);
        if (!selectedExpense) {
            alert(`No expense found with ID ${expenseId}.`);
            return;
        }

        const expensesByMonth = [selectedExpense];

        const doc = new jsPDF();

        // **New Header Design (Smaller & Stylish)**
        doc.setFillColor(255, 102, 0); // Orange color
        doc.roundedRect(0, 0, 210, 25, 10, 10, 'F'); // **Rounded Header**

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text('ROOM EXPENSE INVOICE', 15, 15);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 15, 40);

        this.setBillingPeriod();
        doc.text(`Billing Period: ${this.billingPeriod}`, 15, 50);

        const totalExpense = expensesByMonth.reduce((sum, e) =>
            sum + (e.roomRent || 0) + (e.vegetable || 0) +
            (e.d_mart || 0) + (e.wifi || 0) +
            (e.electricityBill || 0) + (e.gas || 0), 0);

        const contributionPerPerson = totalExpense / (this.roomFellows.length || 1);

        doc.text(`Total Expense: ${totalExpense.toFixed(2)}`, 15, 60);
        doc.text(`Contribution Per Person: ${contributionPerPerson.toFixed(2)}`, 15, 70);

        autoTable(doc, {
            startY: 80,
            head: [['Expense', 'Amount']],
            body: [
                ['Room Rent', expensesByMonth.reduce((sum, e) => sum + (e.roomRent || 0), 0)],
                ['Vegetable', expensesByMonth.reduce((sum, e) => sum + (e.vegetable || 0), 0)],
                ['D-Mart', expensesByMonth.reduce((sum, e) => sum + (e.d_mart || 0), 0)],
                ['WiFi', expensesByMonth.reduce((sum, e) => sum + (e.wifi || 0), 0)],
                ['Electricity Bill', expensesByMonth.reduce((sum, e) => sum + (e.electricityBill || 0), 0)],
                ['Gas', expensesByMonth.reduce((sum, e) => sum + (e.gas || 0), 0)]
            ],
            theme: 'grid',
            styles: { halign: 'center' },
            headStyles: { fillColor: [255, 102, 0] }
        });

        const fellowData = this.roomFellows.map((fellow, index) => [
            index + 1, fellow.name, fellow.phone, contributionPerPerson.toFixed(2)
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Id', 'Room Fellow Name', 'Phone', 'Contribution']],
            body: fellowData,
            theme: 'grid',
            styles: { halign: 'center' },
            headStyles: { fillColor: [255, 102, 0] }
        });

        doc.save(`Room_Expense_Invoice_${this.billingPeriod}.pdf`);
        console.log("✅ Invoice Generated Successfully for", this.billingPeriod);

        const fileURL = URL.createObjectURL(doc.output('blob'));
        const whatsappMessage = 'Room Expense Invoice: Download & Send Manually';
        const whatsappURL = `https://web.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappURL, '_blank');
    }, 500);
}
}