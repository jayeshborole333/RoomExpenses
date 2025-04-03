import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Import this

@NgModule({
  //declarations: [RoomExpensesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule, // ✅ Add this
  ],
})
export class RoomExpensesModule {} // ✅ Make sure this module is imported in the main module
