import React, { Fragment } from "react";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    injectStripe,
    StripeProvider,
    Elements,
  } from 'react-stripe-elements';
  
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {payOrder} from "../../../../services/api/httpclient";
const createOptions = () => {
    return {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          letterSpacing: '0.025em',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#c23d4b',
        },
      },
    };
  };

class StripeForm extends React.Component {
    constructor(props){
        super(props);
        this.state={
            errorMessage:'',
            
        }
    }
    handleChange = ({error}) => {
        if (error) {
          this.setState({errorMessage: error.message});
        }
      };
    handleSubmit = (evt) => {
        evt.preventDefault();
        console.log("handle submit");
        if (this.props.stripe) {
            this.props.stripe.createToken().then(this.props.handleResult);
        } else {
            console.log("Stripe.js hasn't loaded yet.");
        }
    };

    handleResult = () => {
      console.log("aaaaa");
    }
    render() {       
        return (
            <div>
                <MuiThemeProvider>
                    <div>
                        <div> Market Place </div>
                        <div style={{ margin: 20, textAlign:'center', width:'100%'}}>
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <div className="split-form">
                            <label>
                                Card number
                                <CardNumberElement
                                {...createOptions()}
                                onChange={this.handleChange}
                                />
                            </label>
                            </div>
                            <div className="split-form">
                            <label>
                                Expiration date
                                <CardExpiryElement
                                {...createOptions()}
                                onChange={this.handleChange}
                                />
                            </label>
                            </div>
                            <div className="split-form">
                            <label>
                                CVC
                                <CardCVCElement {...createOptions()} onChange={this.handleChange} />
                            </label>                            
                            </div>
                            <div className="error" role="alert">
                            {this.state.errorMessage}
                            </div>
                            <button>Pay</button>
                        </form>
                        </div>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
}
const _StripeForm = injectStripe(StripeForm);

export class StripeScreen extends React.Component {
    componentWillMount(){
    }
    render() {
      return (
        <StripeProvider apiKey="pk_test_VjrigsCUtX6uWYWa23jP5Tt400feU8fVEa">
          <Elements>
            <_StripeForm handleResult={this.props.handleResult} />
          </Elements>
        </StripeProvider>
      );
    }
  }

export default StripeScreen;