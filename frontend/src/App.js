import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Plus, Activity, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatusMonitoringDashboard = () => {
  const [statusChecks, setStatusChecks] = useState([]);
  const [stats, setStats] = useState({
    total_checks: 0,
    active_today: 0,
    avg_response_time: 0,
    healthy_count: 0,
    unhealthy_count: 0
  });
  const [newClientName, setNewClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatusChecks = async () => {
    try {
      setRefreshing(true);
      const [checksResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/status`),
        axios.get(`${API}/stats`)
      ]);
      setStatusChecks(checksResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const createStatusCheck = async (e) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    
    try {
      setLoading(true);
      const response = await axios.post(`${API}/status`, {
        client_name: newClientName.trim(),
        status: "healthy",
        response_time_ms: Math.floor(Math.random() * 10) + 1 // Random response time 1-10ms
      });
      setStatusChecks(prev => [response.data, ...prev]);
      setStats(prev => ({
        ...prev,
        total_checks: prev.total_checks + 1,
        healthy_count: prev.healthy_count + 1
      }));
      setNewClientName("");
    } catch (error) {
      console.error("Error creating status check:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  const getStatusColor = (timestamp) => {
    const diffMs = new Date() - new Date(timestamp);
    const diffMins = diffMs / 60000;
    
    if (diffMins < 5) return "bg-green-500";
    if (diffMins < 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  useEffect(() => {
    fetchStatusChecks();
    const interval = setInterval(fetchStatusChecks, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="h-8 w-8 text-blue-600" />
                Integration Status Monitor
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Real-time monitoring of client integrations and health checks
              </p>
            </div>
            <Button 
              onClick={fetchStatusChecks} 
              disabled={refreshing}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Add New Status Check */}
        <Card className="mb-8 shadow-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Status Check
            </CardTitle>
            <CardDescription>
              Monitor a new client integration or service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createStatusCheck} className="flex gap-4">
              <Input
                placeholder="Enter client name or service identifier..."
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !newClientName.trim()}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Check
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Checks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total_checks}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_today}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Response</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.avg_response_time}ms</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Checks List */}
        <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Recent Status Checks</CardTitle>
            <CardDescription>
              Latest health checks and integration statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusChecks.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No status checks yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Add your first client to start monitoring</p>
              </div>
            ) : (
              <div className="space-y-4">
                {statusChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-3 h-3 rounded-full", getStatusColor(check.timestamp))} />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {check.client_name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          ID: {check.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-xs">
                        {getTimeSince(check.timestamp)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {new Date(check.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(check.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StatusMonitoringDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;