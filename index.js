import express from "express";
import bodyParser from "body-parser"
import morgan from 'morgan'
import {createClient} from '@supabase/supabase-js'

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("public"));

const supabaseUrl = 'https://myquawiyghqmhfkazkxr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cXVhd2l5Z2hxbWhma2F6a3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzODE3NTksImV4cCI6MjAyMzk1Nzc1OX0.IKCmT6ZG3-lk8bbxnbljc5jTBHV9NzfkSsxJu43Rjfw'
const supabase = createClient(supabaseUrl, supabaseKey)
  
//TODOnode
// use api from https://www.npmjs.com/package/olap-cube-js?activeTab=readme#how-cube-is-work

app.get("/", (req,res) => {
    res.render("index.ejs");
})

app.get('/test', async (req, res) => {
    const {data, error} = await supabase
        .from('doctors')
        .select()
    res.send(data);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
})


app.get('/num_appointments', async (req, res) => {
    let { data, error } = await supabase
    .rpc('get_appointment_counts')

    if (error) {
        res.send(error)
    };

  res.send(data);
});

app.get('/docByHosp', async (req, res) => {
    let { data, error } = await supabase
    .rpc('get_doctor_by_clinic', {hospname: req.body.Hospital});
    if (error) {
        res.send(error)
    }
});
    
app.get('/patientsAppointment', async (req, res) => {
    console.log(req.body.patientsid);
    let { data, error } = await supabase
    .rpc('get_appointments_by_patient', {patientsid: req.body.patientsid,
                                        year: req.body.year});
    if (error) {
        res.send(error)
    };
  res.send(data);
});



app.get('/appointmentsClinic', async (req, res) => {
    console.log(req.body.hospitalid);
    let { data, error } = await supabase
    .from('appointments')
    .select(`a_id,
            a_status,
            a_queuetime,
            a_type,
            a_isvirtual,
            clinics (
                c_id,
                c_hospital
            )`)
    .eq('c_id', req.body.hospitalid) 
    if (error) {
        res.send(error)
    };
  res.send(data);
});
