import React, { Component} from 'react';
import PropTypes from 'prop-types';
class Checkbox extends Component {
    state = {
      isChecked: false,
    }
  
    toggleCheckboxChange = () => {
      const { handleCheckboxChange, label } = this.props;
      this.setState({isChecked:!this.state.isChecked}, function(){
        handleCheckboxChange(this.state.isChecked);
      });
    }
  
    componentWillReceiveProps(nextProps) {
      if (nextProps != this.props) {
        this.setState({isChecked:nextProps.checked});
      }
  }
    componentDidMount(){
      this.setState({isChecked:this.props.checked});
    }
    render() {
      const { label } = this.props;
      const { isChecked } = this.state;
  
      return (
        <div className="checkbox">
          <label>
            <input
                              type="checkbox"
                              value={label}
                              checked={isChecked}
                              onChange={this.toggleCheckboxChange}
                          />
  
            {label}
          </label>
        </div>
      );
    }
  }
  
  Checkbox.propTypes = {
    label: PropTypes.string.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
  };
  
  export default Checkbox;