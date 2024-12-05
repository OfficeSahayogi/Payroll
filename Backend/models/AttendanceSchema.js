import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  year: { type: Number, required: true }, // Year field (e.g., 2024)
  month: { type: String, required: true }, // Month field (e.g., '01' for January, '11' for November)
  attendance: {
    type: Map,
    of: {
      status: { type: String, enum: ['Present', 'Absent', 'Half-Day'], required: true },
      hoursWorked: { type: Number, default: 0 }
    },
    required: true
  },
},
{ timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
