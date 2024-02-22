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


// Define routes
app.get('/appointments', (req, res) => {
    res.render('appointments.ejs'); 
});

app.get('/patients', (req, res) => {
    res.render('patients.ejs'); 
});

app.get('/clinics', (req, res) => {
    res.render('clinics.ejs'); 
});

app.get('/doctors', (req, res) => {
    res.render('doctors.ejs'); 
});

app.get('/drilldown', (req, res) => {
    res.render('drilldown.ejs'); 
});

app.get('/rollup', (req, res) => {
    res.render('rollup.ejs'); 
});

app.get('/dice', (req, res) => {
    res.render('dice.ejs'); 
});

app.get('/slice', (req, res) => {
    res.render('slice.ejs'); 
});

//DRILL DOWN
app.get('/docByHosp', async (req, res) => {
    try {
        const hospname = req.query.hospname; 
        let { data, error } = await supabase
            .rpc('get_doctor_by_clinic', { hospname: hospname });
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(data);
            console.log(data);
        }
    } catch (error) {
        console.error('Error fetching doctor information by clinic:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//DICE
app.post('/patientsAppointment', async (req, res) => {
    console.log(req.body.patientsid);
    try {
        let { data, error } = await supabase.rpc('get_appointments_by_patient', {
            patientsid: req.body.patientsid,
            year: req.body.year
        });
        if (error) {
            res.send(error);
        } else {
            res.json(data); 
            console.log(data);
        }
    } catch (error) {
        console.error('Error fetching appointments:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROLL UP
app.get('/num_appointments', async (req, res) => {
    try {
        let { data, error } = await supabase.rpc('get_appointment_counts');
        if (error) {
            throw error;
        }
        res.json(data);
        console.log(data);
    } catch (error) {
        console.error('Error fetching appointment counts:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


//SLICE
app.get('/appointmentsClinic', async (req, res) => {
    try {
        const hospitalId = req.query.hospitalid;
        console.log(hospitalId);
        if (!hospitalId) {
            return res.status(400).json({ error: 'Hospital ID is required' });
        }
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
            .eq('c_id', hospitalId);

            console.log(data);
        if (error) {
            console.log(data);
            throw error;
        }
        
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error', error.message);
        res.status(500).send('Internal Server Error');
    }
});









app.get('/t_appointments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('a_id, p_id, c_id, d_id, a_status, a_queuetime, queuedate, a_starttime, a_endtime, a_type, a_isvirtual');
        
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(data);
        console.log(data)
    } catch (error) {
        console.error('Error fetching appointments:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/t_clinics', async (req, res) => {
    let { data, error } = await supabase
    .from('clinics')
    .select('clinics')
    if (error) {
        res.send(error)
    };
  res.send(data);
});

app.get('/t_doctors', async (req, res) => {
    let { data, error } = await supabase
    .from('doctors')
    .select('doctors')
    if (error) {
        res.send(error)
    };
  res.send(data);
});

app.get('/t_patients', async (req, res) => {
    let { data, error } = await supabase
    .from('patients')
    .select('patients')
    if (error) {
        res.send(error)
    };
  res.send(data);
});



app.listen(process.env.PORT || port, () => {
    console.log(`Server running on port ${port}.`);
})
