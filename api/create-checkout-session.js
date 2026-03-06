import Stripe from "stripe"
import sendEmail from "../../send-email.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end("Method Not Allowed")
  try{
    const {amount} = req.body
    const session = await stripe.checkout.sessions.create({
      payment_method_types:["card"],
      mode:"payment",
      line_items:[{
        price_data:{
          currency:"eur",
          product_data:{name:"Réservation Villa Caboua"},
          unit_amount:amount
        },
        quantity:1
      }],
      success_url:`${req.headers.origin}?success=true`,
      cancel_url:`${req.headers.origin}?canceled=true`
    })
    
    // Envoi email confirmation
    await sendEmail({to:process.env.EMAIL_USER, subject:"Nouvelle réservation", text:`Montant: ${amount/100}€`})
    
    res.status(200).json({url:session.url})
  }catch(err){
    console.log(err)
    res.status(500).json({error:err.message})
  }
}
