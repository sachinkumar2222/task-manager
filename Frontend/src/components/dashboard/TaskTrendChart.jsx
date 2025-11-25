import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

/**
 * TaskTrendChart
 * Ek reusable component jo task completion data ko line chart mein dikhata hai.
 * Props:
 * - data: Array - Chart ke liye data (e.g., stats.taskTrendData)
 */
const TaskTrendChart = ({ data }) => {
    
    // Agar data nahi hai ya khaali hai, toh message dikhayein
    if (!data || data.length === 0) {
        return (
            <p className="text-gray-500 text-center py-4">
                No task completion data available for the last 7 days.
            </p>
        );
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="name" // 'Mon', 'Tue'
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        allowDecimals={false} // No decimal points
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                        labelFormatter={(label, payload) => {
                            // Show full date on tooltip
                            if (payload && payload[0]) {
                                return payload[0].payload.date; // 'YYYY-MM-DD'
                            }
                            return label;
                        }}
                        formatter={(value) => [`${value} tasks`, 'Completed']} // Customize tooltip content
                    />
                    <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Tasks Completed"
                        stroke="#4f46e5" // Indigo color
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TaskTrendChart;
