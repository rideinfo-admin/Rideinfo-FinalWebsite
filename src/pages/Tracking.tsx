import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Gauge, MapPin, Navigation } from 'lucide-react';

interface BusLocation {
  bus_id: number;
  bus_number: string;
  bus_short_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  last_update: string;
  is_moving: boolean;
}

const Tracking = () => {
  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchInitialData();
    
    // Note: WebSocket connection would need the correct institute ID
    // For now, we'll use REST API polling as fallback
    const interval = setInterval(fetchInitialData, 5000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await api.get('/institutes/buses/');
      const busesData = response.data.results
        ?.filter((bus: any) => bus.current_latitude && bus.current_longitude)
        .map((bus: any) => ({
          bus_id: bus.id,
          bus_number: bus.bus_number,
          bus_short_name: bus.bus_short_name,
          latitude: parseFloat(bus.current_latitude),
          longitude: parseFloat(bus.current_longitude),
          speed: bus.current_speed || 0,
          last_update: bus.last_location_update,
          is_moving: bus.is_moving,
        })) || [];
      
      setBuses(busesData);
    } catch (error) {
      console.error('Failed to fetch bus locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Bus Tracking</h1>
          <p className="text-muted-foreground">Real-time location monitoring of all buses</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Auto-refresh every 5 seconds
        </Badge>
      </div>

      {buses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buses.map((bus) => (
            <Card key={bus.bus_id} className="p-4 hover:shadow-lg transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bus.is_moving ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Bus className={`h-6 w-6 ${bus.is_moving ? 'text-green-700' : 'text-gray-700'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{bus.bus_short_name}</h3>
                      <p className="text-sm text-muted-foreground">{bus.bus_number}</p>
                    </div>
                  </div>
                  <Badge className={bus.is_moving ? 'status-badge status-moving' : 'status-badge status-stopped'}>
                    {bus.is_moving ? '● Moving' : '○ Stopped'}
                  </Badge>
                </div>

                {/* Speed */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Current Speed</p>
                    <p className="text-lg font-bold">{bus.speed} km/h</p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">GPS Location</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Latitude</p>
                      <p className="font-mono font-medium">{bus.latitude.toFixed(4)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Longitude</p>
                      <p className="font-mono font-medium">{bus.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                </div>

                {/* Last Update */}
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(bus.last_update).toLocaleTimeString()}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => openInMaps(bus.latitude, bus.longitude, bus.bus_short_name)}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  <span className="text-sm font-medium">View on Map</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bus Location Data</h3>
            <p className="text-muted-foreground">
              No buses with active GPS tracking are currently available
            </p>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Buses</p>
              <p className="text-2xl font-bold">{buses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Navigation className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moving Buses</p>
              <p className="text-2xl font-bold">{buses.filter(b => b.is_moving).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Bus className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stopped Buses</p>
              <p className="text-2xl font-bold">{buses.filter(b => !b.is_moving).length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tracking;
