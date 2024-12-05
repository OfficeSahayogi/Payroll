import mongoose from "mongoose";
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String },
  doj: { type: Date, required: true },
  dol: { type: Date, default: null },
  empType: { type: String, enum: ["Staff", "Labor"], required: true },
  org: { type: String, required: true },
  empCode: { type: String, required: true },
  salaryType: { type: String, enum: ["Monthly", "Hourly", "Daily"], required: true },
  salary: { type: Number, default: 0 },
  advances: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      mode:{type:String,required:true}
    },
  ],
},
{timestamps:true});



const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
