import React, { Component } from 'react';
import AddressSuggest from './AddressSuggest';
import AddressInput from './AddressInput';
import axios from 'axios';
import styles from '../../styles/Home.module.css';

const APP_ID = '8lOreHYr4Plm3Hx2eewN';
const APP_KEY ='7vDIwoHH7fP1p_NZ9MLGqHcfYaPapW-iC3jeiaeRBgs';
var isValid = false;

class AddressForm extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();
    this.onQuery = this.onQuery.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onCheck = this.onCheck.bind(this);
    this.onClear = this.onClear.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  onQuery(evt) {
    const query = evt.target.value;

    if (!query.length > 0) {
      this.setState(this.getInitialState());
      return;
    }

    const self = this;
    axios.get('https://geocode.search.hereapi.com/v1/geocode',
      {'params': {
        'app_id': APP_ID,
        'apiKey': APP_KEY,
        'q': query,
        'maxresults': 1,
      }}).then(function (response) {
          if (response.data.items.length > 0) {
            const id = response.data.items[0].id;
            const address = response.data.items[0].address;
            self.setState({
              'address' : address,
              'query' : query,
              'locationId': id,
              'fullAddress': address.label
            })
          } else {
            const state = self.getInitialState();
            self.setState(state);
          }
      });
  }

  getInitialState() {
    return {
      'address': {
        'street': '',
        'city': '',
        'state': '',
        'postalCode': '',
        'country': ''
      },
      'query': '',
      'locationId': '',
      'isChecked': false,
      'coords': {}
    }
  }

  onClear(evt) {
    isValid = false;
    const state = this.getInitialState();
    this.setState(state);
  }

  onAddressChange(evt) {
    const id = evt.target.id
    const val = evt.target.value

    let state = this.state
    state.address[id] = val;
    this.setState(state);
  }

  onCheck(evt) {
    let params = {
      'app_id': APP_ID,
      'apiKey': APP_KEY,
      'q': this.state.fullAddress
    }

    if (this.state.locationId.length > 0) {
      params['locationId'] = this.state.locationId;
    } else {
      params['searchtext'] = this.state.address.street
        + this.state.address.City
        + this.state.address.State
        + this.state.address.PostalCode
        + this.state.address.Country
    }

    const self = this;
    axios.get('https://geocode.search.hereapi.com/v1/geocode?apiKey=7vDIwoHH7fP1p_NZ9MLGqHcfYaPapW-iC3jeiaeRBgs',
      {'params': {
        'app_id': APP_ID,
        'apiKey': APP_KEY,
        'q': this.state.fullAddress,
        'maxresults': 1,
      } }
      ).then(function (response) {
        const view = response.data.items;
        if (view.length > 0 && view[0].access.length > 0) {
          const location = view[0];

          self.setState({
            'isChecked': 'true',
            'locationId': '',
            'query': location.address.label,
            'address': {
              'street': location.address.houseNumber + ' ' + location.address.street,
              'city': location.address.city,
              'state': location.address.state,
              'postalCode': location.address.postalCode,
              'country': location.address.countryName
            },
            'coords': {
              'lat': location.access[0].lat,
              'lon': location.access[0].lng
            }
          });
        } else {
          self.setState({
            isChecked: true,
            coords: null
          })
        }

      })
      .catch(function (error) {
        console.log('caught failed query', error);
        self.setState({
          isChecked: true,
          coords: null
        });
      });
  }

  submitForm (evt) {
    console.log('Form will be submitted')
    evt.preventDefault();
    // Save address information to database and advance user to
    // entering email address and pick password complete signup
    this.setState(this.getInitialState());
  }

  alert() {

    if (!this.state.isChecked) {
      return;
    }

    if (this.state.coords === null) {
      return (
        <div role="alert">
          <b>Invalid.</b> The address is not recognized.
        </div>
      );
    }

    var co = this.state.address;
    var pos = co.postalCode.split('-')[0];
    if (co.state === "Colorado" || ('80001' <= pos && pos <= '81658') || co.postalCode === "CO") {
      isValid = true;
      return (
        <div role="alert">
          <b>Valid Address.</b>  Location is {this.state.coords.lat}, {this.state.coords.lon}.
        </div>
      );
    } else {
      isValid = false;
      return (
        <div role="alert">
          <b>Invalid.</b> The address must be in Colorado.
        </div>
      );
    }
  }

  render() {
    let result = this.alert();
    return (
        <div className={styles.container, styles.address}>
          <AddressSuggest
            query={this.state.query}
            onChange={this.onQuery}
            />
          <AddressInput
            street={this.state.address.street}
            city={this.state.address.city}
            state={this.state.address.state}
            postalCode={this.state.address.postalCode}
            country={this.state.address.country}
            onChange={this.onAddressChange}
            />
          <br></br>
          { result ? result : <br></br>}
          <button type="submit" onClick={this.onCheck}>Check</button>   |
          <button type="submit" onClick={this.onClear}>Clear</button>   |
          { result && isValid ? <button type="submit" onClick={this.submitForm}>Sumbit</button> : null}
        </div>
    );
  }
}

export default AddressForm;