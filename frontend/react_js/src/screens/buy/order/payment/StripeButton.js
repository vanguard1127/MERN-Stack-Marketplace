import React, { Fragment } from "react";
import StripeCheckout from "react-stripe-checkout";
import {payOrder} from "../../../../services/api/httpclient";

const StripeButton = (amout) => {
  const publishableKey = "pk_test_VjrigsCUtX6uWYWa23jP5Tt400feU8fVEa";
  const name = "Pay " + JSON.stringify(amout.amout) + "$";
  const pState = amout.state;
  const onToken = token => {
    const body = {
      amount: amout.amout * 100,
      stripe_token: token,
      type:0
    };
    
    payOrder(body).then( ret => {
      if (ret.data.success === true){
      alert("Payment Success");
      }
      
    }).catch(err=>{
      console.log("Payment Error: ", JSON.stringify(err));
      if (err.response.status === 300){
        amout.props.history.push('/users/signin');
      }
      alert("Payment Error");
    });

  };
  return (
    <StripeCheckout
      label="Checkout Stripe" //Component button text
      name="MarketPlace" //Modal Header
      description="Upgrade to a premium account today."
      panelLabel={name}  //Submit button in modal
      amount={amout * 100} //Amount in cents $9.99
      token={onToken}
      stripeKey={publishableKey}      
      locale="auto"
      billingAddress={false}
      shippingAddress
      //zipcode
    />
  );
};
export default StripeButton;