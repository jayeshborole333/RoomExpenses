import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Roomfellow } from '../model/roomfellow.model';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roomfellow',
  standalone: true,
  templateUrl: './roomfellow.component.html',
  styleUrls: ['./roomfellow.component.css'],
  imports: [CommonModule, NgFor, FormsModule],
})
export class RoomfellowComponent implements OnInit {
  roomFellows: Roomfellow[] = [];
  newFellow: Partial<Roomfellow> = { name: '', email: '', phone: '' };
  isEditing: boolean = false;
  editingFellowId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getRoomfellows().subscribe(
      (data: Roomfellow[]) => {
        console.log('Received Data:', data);
        this.roomFellows = data;
      },
      (error) => {
        console.error('Error fetching room fellows:', error);
      }
    );
  }

  getRoomfellows(): Observable<Roomfellow[]> { 
    console.log('API request started...'); 
    return this.http.get<Roomfellow[]>('http://localhost:8081/api/roomfellows').pipe(
      tap((data) => console.log('Received Data:', data)),
      catchError((error) => {
        console.error('Error fetching data:', error);
        return throwError(error);
      })
    );
  }

  addRoomFellow() {
    if (!this.newFellow.name || !this.newFellow.email || !this.newFellow.phone) {
      alert('All fields are required!');
      return;
    }

    this.http.post<Roomfellow>('http://localhost:8081/api/roomfellows', this.newFellow)
      .subscribe(
        (newFellow) => {
          console.log('New Room Fellow Added:', newFellow);
          this.roomFellows.push(newFellow);
          this.newFellow = { name: '', email: '', phone: '' }; // Reset form
        },
        (error) => {
          console.error('Error adding room fellow:', error);
        }
      );
  }

  editRoomFellow(fellow: Roomfellow) {
    this.isEditing = true;
    this.editingFellowId = fellow.id;
    this.newFellow = { ...fellow };  // Existing data ko form me load karein
  }

  updateRoomFellow() {
    if (!this.newFellow.name || !this.newFellow.email || !this.newFellow.phone) {
      alert('All fields are required!');
      return;
    }

    this.http.put<Roomfellow>(`http://localhost:8081/api/roomfellows/${this.editingFellowId}`, this.newFellow)
      .subscribe(
        (updatedFellow) => {
          console.log('Room Fellow Updated:', updatedFellow);
          this.roomFellows = this.roomFellows.map(fellow =>
            fellow.id === this.editingFellowId ? updatedFellow : fellow
          );
          this.isEditing = false;
          this.editingFellowId = null;
          this.newFellow = { name: '', email: '', phone: '' }; // Reset form
        },
        (error) => {
          console.error('Error updating room fellow:', error);
        }
      );
  }

  deleteRoomfellow(id: number | null) {
    if (confirm('Are you sure you want to delete this Room Fellow?')) {
      this.http.delete(`http://localhost:8081/api/roomfellows/${id}`).subscribe(
        () => {
          console.log(`Room Fellow with ID ${id} deleted successfully.`);
          this.roomFellows = this.roomFellows.filter(fellow => fellow.id !== id);
        },
        (error) => {
          console.error('Error deleting room fellow:', error);
        }
      );
    }
  }
}
