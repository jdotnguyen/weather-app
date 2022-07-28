import React from 'react';
import './App.less';
import { WeatherData, ForecastData } from './Interfaces';

class App extends React.Component<{}, {loading: boolean, city: string, country: string, forecastData: ForecastData, weatherData: WeatherData}> {
  controller: any;
  signal: any;
  constructor(props: any) {
    super(props);
    this.state = {
      loading: true,
      city: 'Ottawa',
      country: 'Canada',
      forecastData: {},
      weatherData: {}
    };

    // Handle aborting asynchronous calls if we want new data
    this.controller = null;
    this.signal = null;
  }

  // Init
  componentDidMount() {
    this.getWeatherData('Ottawa', 'Canada');
    this.getForecastData('Ottawa', 'Canada');
  }

  // Get weather data
  getWeatherData = async (city: string, country: string) => {
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    try {
      const response = await fetch(`https://api.weatherbit.io/v2.0/current?city=${city}&country=${country}&key=d34af2a2df104a25b1cfbb226d249b62&include=minutely`, {
        method: 'get',
        signal: this.signal
      });
      const jsonResponse = await response.json();
      this.setState({
        loading: false,
        city: city,
        country: country,
        weatherData: jsonResponse,
        forecastData: this.state.forecastData
      });
    } catch (e) {
    }
  }

  // Get 16 day forecast
  getForecastData = async (city?: string, country?: string) => {
    try {
      const response = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city || this.state.city}&country=${country || this.state.country}&key=d34af2a2df104a25b1cfbb226d249b62`, {
        method: 'get',
        signal: this.signal
      });
      const jsonResponse = await response.json();
      this.getDayOfWeek(jsonResponse);
    } catch (e) {
    }
  }

  // Convert day of week
  getDayOfWeek(forecastData: any) {
    let tempData = forecastData;

    // Iterate through each day to get day label
    let dayOfWeek;
    for (const day of tempData.data) {
      dayOfWeek = new Date(day.valid_date).getDay();
      day.weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayOfWeek];
    }

    // Update UI
    this.setState({ 
      loading: false,
      city: this.state.city,
      country: this.state.country,
      weatherData: this.state.weatherData,
      forecastData: tempData 
    });
  }

  // Handle city click (tabs)
  handleCityClick = (city: string, country: string) => {
    // Skip previous call
    this.controller.abort();

    // Update UI then call for weather data
    this.setState({ 
      loading: true,
      city: city,
      country: country,
      weatherData: this.state.weatherData,
      forecastData: this.state.forecastData
    }, () => this.getWeatherData(city, country));
  }

  render() {
    return (
      <div className="App">
        <div className="App-tabs">
          <div 
            onClick={() => this.handleCityClick('Ottawa', 'Canada')}
            className={`App-tab ${this.state.city === 'Ottawa' && 'active'}`}>Ottawa</div>
          <div 
            onClick={() => this.handleCityClick('Moscow', 'Russia')}
            className={`App-tab ${this.state.city === 'Moscow' && 'active'}`}>Moscow</div>
          <div 
            onClick={() => this.handleCityClick('Tokyo', 'Japan')}
            className={`App-tab ${this.state.city === 'Tokyo' && 'active'}`}>Tokyo</div>
        </div>
  
        <div className="App-weather-body">
          {!this.state.loading ?
            <>
              <div className="App-weather-today-body">
                <div className="App-weather-today-header">Today</div>
                <div className="App-weather-today-graphic-body">
                  <div className="App-weather-today-icon">
                    <img src={`https://www.weatherbit.io/static/img/icons/${this.state.weatherData?.data?.[0]?.weather?.icon}.png`} />
                  </div>
                  <div className="App-weather-stats-body">
                    <div className="App-weather-today-temperature">{this.state.weatherData?.data?.[0]?.temp}&deg;</div>
                    <div className="App-weather-today-description">{this.state.weatherData?.data?.[0]?.weather?.description}</div>
                  </div>
                </div>
              </div>
              <div className="App-weather-week-body">
                {this.state.forecastData?.data?.slice(1, 5).map((day: any, index: number) => (
                  <div key={index} className="App-weather-week-day-body">
                    <div className="App-weather-week-day-header">{day?.weekday}</div>
                    <div className="App-weather-week-day-icon"><img src={`https://www.weatherbit.io/static/img/icons/${day?.weather?.icon}.png`} /></div>
                    <div className="App-weather-week-day-temperature">{day?.temp}&deg;</div>
                  </div>
                ))}
              </div>
            </> : 
            <div className="App-loading-state">Loading...</div>
          }
        </div>
      </div>
    );
  }
}

export default App;
