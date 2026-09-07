import React, { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DataCollectorProps {
  mineSiteId: string;
  isActive: boolean;
}

export const DataCollector: React.FC<DataCollectorProps> = ({ mineSiteId, isActive }) => {
  const { toast } = useToast();
  const intervalRefs = useRef<{
    sensor: NodeJS.Timeout | null;
    weather: NodeJS.Timeout | null;
    thermal: NodeJS.Timeout | null;
  }>({
    sensor: null,
    weather: null,
    thermal: null,
  });

  // Generate realistic sensor data
  const generateSensorData = () => {
    const baseTemperature = 35 + Math.random() * 10; // 35-45°C typical for Indian mining
    return {
      vibration: Math.random() * 0.8, // 0-0.8 range
      tilt: Math.random() * 5, // 0-5 degrees
      moisture: 45 + Math.random() * 30, // 45-75% humidity typical for India
      temperature: baseTemperature,
      strain: 1.5 + Math.random() * 2, // 1.5-3.5 MPa
      displacement: Math.random() * 3, // 0-3mm
    };
  };

  // Generate Indian weather data
  const generateWeatherData = () => {
    const currentMonth = new Date().getMonth() + 1;
    const isMonsoon = currentMonth >= 6 && currentMonth <= 9;

    return {
      temperature: isMonsoon ? 28 + Math.random() * 8 : 32 + Math.random() * 12,
      humidity: isMonsoon ? 70 + Math.random() * 25 : 45 + Math.random() * 30,
      rainfall: isMonsoon ? Math.random() * 50 : Math.random() * 5,
      windSpeed: 8 + Math.random() * 15,
      pressure: 1010 + Math.random() * 15,
      visibility: Math.random() > 0.8 ? 'poor' : 'good',
    };
  };

  // Generate thermal imaging data
  const generateThermalData = () => {
    const baseTemp = 40 + Math.random() * 20;
    const hotSpots = Math.floor(Math.random() * 6);

    return {
      averageTemp: baseTemp,
      maxTemp: baseTemp + 10 + Math.random() * 20,
      hotSpots,
      thermalAnomaly: hotSpots > 3 || Math.random() > 0.8,
    };
  };

  // Send data to ingestion function via FastAPI
  const sendData = async (streamType: string, data: any, source: string) => {
    try {
      const response = await api.post('/api/data/ingestion', {
        streamType,
        mineSiteId,
        data,
        source,
        indianConditions: {
          geological_type: 'Laterite',
          monsoon_season: true,
          groundwater_level: 4.5,
        },
      });
      console.log(`${streamType} data ingested successfully:`, response);
    } catch (error) {
      console.warn(`Error sending ${streamType} data to FastAPI:`, error);
    }
  };

  // Start data collection
  const startDataCollection = () => {
    console.log('Starting data collection for mine site:', mineSiteId);

    // Sensor data every 3 seconds
    intervalRefs.current.sensor = setInterval(() => {
      const sensorData = generateSensorData();
      sendData('sensor', sensorData, 'simulator_sensor');
    }, 3000);

    // Weather data every 10 seconds
    intervalRefs.current.weather = setInterval(() => {
      const weatherData = generateWeatherData();
      sendData('weather', weatherData, 'simulator_weather');
    }, 10000);

    // Thermal data every 8 seconds
    intervalRefs.current.thermal = setInterval(() => {
      const thermalData = generateThermalData();
      sendData('thermal', thermalData, 'simulator_thermal');
    }, 8000);

    toast({
      title: "📊 Data Collection Started",
      description: "Real-time mining data simulation is now active",
    });
  };

  // Stop data collection
  const stopDataCollection = () => {
    Object.values(intervalRefs.current).forEach((interval) => {
      if (interval) clearInterval(interval);
    });

    intervalRefs.current = { sensor: null, weather: null, thermal: null };

    toast({
      title: "⏹️ Data Collection Stopped",
      description: "Mining data simulation has been paused",
    });
  };

  // Effect to handle active state changes
  useEffect(() => {
    if (isActive) {
      startDataCollection();
    } else {
      stopDataCollection();
    }

    // Cleanup on unmount
    return () => {
      stopDataCollection();
    };
  }, [isActive, mineSiteId]);

  return null; // This component doesn't render anything
};

export default DataCollector;