require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const Lead = require('./models/lead');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

  app.get('/',(req,res)=>{
    res.send('server is running!')
  })

// Facebook Webhook Verification
app.get('/webhook/facebook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('📩 Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook Listener for Leads
// app.post('/webhook/facebook', async (req, res) => {
//   // const body = req.body;
//           const fbleadId = "701545133047863"
//       try {
//             const response = await axios.get(
//               `https://graph.facebook.com/v23.0/${fbleadId}?access_token=${process.env.PAGE_ACCESS_TOKEN}`
//             );
//             console.log('jjjjjjjjjjjj')
//             const leadData = response.data;

//             await Lead.create({
//               leadId: leadData.id,
//               formId: leadData.form_id,
//               createdTime: leadData.created_time,
//               fieldData: leadData.field_data
//             });

//             console.log('✅ Lead saved:', leadData.id);
//           } catch (err) {
//             if (err.response) {
//               console.error('❌ Facebook API Error:', err.response.data); // Print the real error
//             } else {
//               console.error('❌ Unknown Error:', err.message);
//             }
//           }

//   // if (body.object === 'page') {
//   //   for (const entry of body.entry) {
//   //     for (const change of entry.changes) {
//   //       if (change.field === 'leadgen') {
//   //         const leadId = change.value.leadgen_id;
//   //         const fbleadId = "61578767666649"
//   //         try {
//   //           const response = await axios.get(
//   //             `https://graph.facebook.com/v19.0/${leadId?leadId:fbleadId}?access_token=${process.env.PAGE_ACCESS_TOKEN}`
//   //           );

//   //           const leadData = response.data;

//   //           await Lead.create({
//   //             leadId: leadData.id,
//   //             formId: leadData.form_id,
//   //             createdTime: leadData.created_time,
//   //             fieldData: leadData.field_data
//   //           });

//   //           console.log('✅ Lead saved:', leadData.id);
//   //         } catch (err) {
//   //           console.error('❌ Error fetching/saving lead:', err.message);
//   //         }
//   //       }
//   //     }
//   //   }
//   //   res.sendStatus(200);
//   // } else {
//   //   res.sendStatus(404);
//   // }
// });

app.post('/webhook/facebook', async (req, res) => {
  try {
    const body = req.body;
    console.log("body>>>>>>",body)  
    // ✅ Respond immediately to Facebook to avoid timeouts
    res.sendStatus(200);

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            const leadId = change.value.leadgen_id;
            console.log('leadId>>>>>>>>>>',leadId);
            try {
              const response = await axios.get(
                `https://graph.facebook.com/v23.0/${leadId}?access_token=${process.env.PAGE_ACCESS_TOKEN}`
              );
              
              const leadData = response.data;

              await Lead.create({
                leadId: leadData.id,
                formId: leadData.form_id,
                createdTime: leadData.created_time,
                fieldData: leadData.field_data
              });

              console.log('✅ Lead saved:', leadData.id);
            } catch (err) {
              console.error('❌ Facebook API error:', err.response?.data || err.message);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    res.sendStatus(500);
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
