export interface WeatherData {
    data?: {
        weather: {
            icon: string;
            description: string;
        };
        temp: number;
    }[];
}

export interface ForecastData {
    data?: {
        weekday: string;
        weather: {
            icon: string;
        };
        temp: number;
    }[];
}