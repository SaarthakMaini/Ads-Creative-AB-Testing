import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

export default function Performance() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [performance, setPerformance] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState(null);

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests/');
      setTests(res.data);
    } catch (err) {
      setError('Failed to fetch tests');
    }
  };

  const fetchPerformance = async (testId) => {
    try {
      const res = await api.get(`/performance/test/${testId}`);
      setPerformance(res.data);
    } catch (err) {
      setError('Failed to fetch performance');
    }
  };

  const fetchMetrics = async (productId) => {
    try {
      const res = await api.get(`/performance/metrics?product_id=${productId}`);
      setMetrics(res.data);
    } catch (err) {
      setError('Failed to fetch metrics');
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      setError(null);
      fetchPerformance(selectedTest);
      const test = tests.find(t => t.id === selectedTest);
      if (test) fetchMetrics(test.product_id);
    }
  }, [selectedTest, tests]);

  const handleSimulate = async () => {
    setError(null);
    try {
      await api.post(`/performance/simulate/${selectedTest}`);
      fetchPerformance(selectedTest);
      const test = tests.find(t => t.id === selectedTest);
      if (test) fetchMetrics(test.product_id);
      setError(null);
    } catch (err) {
      setError('Failed to simulate performance');
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>Performance</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <FormControl sx={{ mr: 2, minWidth: 200 }} required>
        <InputLabel>AB Test</InputLabel>
        <Select value={selectedTest} label="AB Test" onChange={e => setSelectedTest(e.target.value)}>
          {tests.map(t => <MenuItem key={t.id} value={t.id}>Test #{t.id} ({t.status})</MenuItem>)}
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleSimulate} disabled={!selectedTest}>Simulate Performance</Button>
      <Box mt={4}>
        <Typography variant="h6">Performance Data</Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Variant</TableCell>
                <TableCell>Impressions</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Conversions</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performance.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.variant_id}</TableCell>
                  <TableCell>{p.impressions}</TableCell>
                  <TableCell>{p.clicks}</TableCell>
                  <TableCell>{p.conversions}</TableCell>
                  <TableCell>{new Date(p.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="h6">Metrics</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="variant_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ctr" fill="#8884d8" name="CTR" />
            <Bar dataKey="cvr" fill="#82ca9d" name="CVR" />
            <Bar dataKey="impression_to_conversion" fill="#ffc658" name="Imp→Conv" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
} 