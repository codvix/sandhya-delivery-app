"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react"

interface PerformanceMetrics {
  totalRequests: number
  averageResponseTime: number
  slowRequests: number
  recentMetrics: Array<{
    method: string
    url: string
    duration: number
    statusCode: number
  }>
}

interface DatabaseMetrics {
  connectionStatus: boolean
  queryCount: number
  averageQueryTime: number
  slowQueries: number
}

export default function PerformancePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchMetrics()
  }, [user, router])

  const fetchMetrics = async () => {
    try {
      // In a real implementation, you'd fetch from your monitoring service
      // For now, we'll simulate the data
      setMetrics({
        totalRequests: 1250,
        averageResponseTime: 245,
        slowRequests: 12,
        recentMetrics: [
          { method: "GET", url: "/api/restaurants", duration: 180, statusCode: 200 },
          { method: "POST", url: "/api/orders", duration: 320, statusCode: 201 },
          { method: "GET", url: "/api/menu", duration: 150, statusCode: 200 },
          { method: "PATCH", url: "/api/orders/123", duration: 450, statusCode: 200 },
          { method: "GET", url: "/api/banners", duration: 90, statusCode: 200 }
        ]
      })
      
      setDbMetrics({
        connectionStatus: true,
        queryCount: 3420,
        averageQueryTime: 45,
        slowQueries: 8
      })
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Performance Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor application performance and database metrics
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchMetrics}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
            >
              Back to Admin
            </Button>
          </div>
        </div>

        {/* Performance Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Requests</p>
                    <p className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Avg Response Time</p>
                    <p className="text-2xl font-bold">{metrics.averageResponseTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Slow Requests</p>
                    <p className="text-2xl font-bold">{metrics.slowRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Performance Score</p>
                    <p className="text-2xl font-bold">
                      {metrics.averageResponseTime < 200 ? "Excellent" : 
                       metrics.averageResponseTime < 500 ? "Good" : "Needs Improvement"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Database Metrics */}
        {dbMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">DB Status</p>
                    <Badge variant={dbMetrics.connectionStatus ? "default" : "destructive"}>
                      {dbMetrics.connectionStatus ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Queries</p>
                    <p className="text-2xl font-bold">{dbMetrics.queryCount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Avg Query Time</p>
                    <p className="text-2xl font-bold">{dbMetrics.averageQueryTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Slow Queries</p>
                    <p className="text-2xl font-bold">{dbMetrics.slowQueries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Requests */}
        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Latest API requests and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.recentMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant={metric.method === "GET" ? "default" : "secondary"}>
                        {metric.method}
                      </Badge>
                      <span className="font-mono text-sm">{metric.url}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm ${
                        metric.duration > 500 ? "text-red-500" : 
                        metric.duration > 200 ? "text-orange-500" : "text-green-500"
                      }`}>
                        {metric.duration}ms
                      </span>
                      <Badge variant={metric.statusCode >= 400 ? "destructive" : "default"}>
                        {metric.statusCode}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
