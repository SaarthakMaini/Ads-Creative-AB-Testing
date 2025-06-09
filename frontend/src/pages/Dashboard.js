import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

export default function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ impressions: 0, clicks: 0, conversions: 0 });

  const fetchAllMetrics = async () => {
    try {
      const productsRes = await api.get('/products/');
      let allMetrics = [];
      let totalImpressions = 0, totalClicks = 0, totalConversions = 0;
      for (const product of productsRes.data) {
        const metricsRes = await api.get(`/performance/metrics?product_id=${product.id}`);
        allMetrics = allMetrics.concat(metricsRes.data.map(m => ({ ...m, product: product.title })));
        metricsRes.data.forEach(m => {
          totalImpressions += m.ctr ? m.ctr * 100 : 0;
          totalClicks += m.cvr ? m.cvr * 100 : 0;
          totalConversions += m.impression_to_conversion ? m.impression_to_conversion * 100 : 0;
        });
      }
      setMetrics(allMetrics);
      setSummary({ impressions: totalImpressions, clicks: totalClicks, conversions: totalConversions });
    } catch (err) {
      setError('Failed to fetch dashboard metrics');
    }
  };

  useEffect(() => {
    fetchAllMetrics();
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={2}>Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Impressions</Typography>
            <Typography variant="h5">{summary.impressions}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Clicks</Typography>
            <Typography variant="h5">{summary.clicks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Conversions</Typography>
            <Typography variant="h5">{summary.conversions}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Typography variant="h6" mb={2}>Product Metrics</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={metrics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ctr" fill="#8884d8" name="CTR" />
          <Bar dataKey="cvr" fill="#82ca9d" name="CVR" />
          <Bar dataKey="impression_to_conversion" fill="#ffc658" name="Imp→Conv" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
} 