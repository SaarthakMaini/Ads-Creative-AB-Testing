import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert, MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import api from '../api/axios';

export default function ABTests() {
  const [abtests, setABTests] = useState([]);
  const [products, setProducts] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [productId, setProductId] = useState('');
  const [variantIds, setVariantIds] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [bestCreative, setBestCreative] = useState(null);
  const [loadingBest, setLoadingBest] = useState(false);

  const fetchABTests = async () => {
    try {
      const res = await api.get('/tests/');
      setABTests(res.data);
    } catch (err) {
      setError('Failed to fetch AB tests');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const fetchCreatives = async () => {
    try {
      const res = await api.get('/creatives/');
      setCreatives(res.data);
    } catch (err) {
      setError('Failed to fetch creatives');
    }
  };

  const fetchBestCreative = async (abtestId) => {
    setLoadingBest(true);
    setBestCreative(null);
    try {
      const res = await api.get(`/performance/suggest/${abtestId}`);
      setBestCreative(res.data);
    } catch (err) {
      setBestCreative({ message: 'Failed to fetch suggestion.' });
    }
    setLoadingBest(false);
  };

  useEffect(() => {
    fetchABTests();
    fetchProducts();
    fetchCreatives();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/tests/', {
        product_id: Number(productId),
        variant_ids: variantIds.map(Number),
      });
      setProductId('');
      setVariantIds([]);
      fetchABTests();
    } catch (err) {
      setError('Failed to add AB test');
    }
  };

  const handleRowClick = async (id) => {
    try {
      const res = await api.get(`/tests/${id}`);
      setSelectedTest(res.data);
      fetchBestCreative(id);
    } catch (err) {
      setError('Failed to fetch AB test details');
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>A/B Tests</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleAdd} mb={4}>
        <FormControl sx={{ mr: 2, minWidth: 120 }} required>
          <InputLabel>Product</InputLabel>
          <Select value={productId} label="Product" onChange={e => setProductId(e.target.value)}>
            {products.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ mr: 2, minWidth: 200 }} required>
          <InputLabel>Variants</InputLabel>
          <Select
            multiple
            value={variantIds}
            label="Variants"
            onChange={e => setVariantIds(e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((id) => (
                  <Chip key={id} label={creatives.find(c => c.id === id)?.headline || id} />
                ))}
              </Box>
            )}
          >
            {creatives.filter(c => c.product_id === Number(productId)).map(c => (
              <MenuItem key={c.id} value={c.id}>{c.headline}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">Add AB Test</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Variants</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {abtests.map((test) => (
              <TableRow key={test.id} hover onClick={() => handleRowClick(test.id)} style={{ cursor: 'pointer' }}>
                <TableCell>{test.id}</TableCell>
                <TableCell>{products.find(p => p.id === test.product_id)?.title || test.product_id}</TableCell>
                <TableCell>{test.variant_ids.map(id => creatives.find(c => c.id === id)?.headline || id).join(', ')}</TableCell>
                <TableCell>{test.status}</TableCell>
                <TableCell>{test.start_date ? new Date(test.start_date).toLocaleString() : ''}</TableCell>
                <TableCell>{test.end_date ? new Date(test.end_date).toLocaleString() : ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!selectedTest} onClose={() => setSelectedTest(null)}>
        <DialogTitle>AB Test Details</DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box>
              <Typography>ID: {selectedTest.id}</Typography>
              <Typography>Product: {products.find(p => p.id === selectedTest.product_id)?.title || selectedTest.product_id}</Typography>
              <Typography>Variants: {selectedTest.variant_ids.map(id => creatives.find(c => c.id === id)?.headline || id).join(', ')}</Typography>
              <Typography>Status: {selectedTest.status}</Typography>
              <Typography>Start Date: {selectedTest.start_date ? new Date(selectedTest.start_date).toLocaleString() : ''}</Typography>
              <Typography>End Date: {selectedTest.end_date ? new Date(selectedTest.end_date).toLocaleString() : ''}</Typography>
              <Box mt={2}>
                <Typography variant="h6">Best Creative Suggestion</Typography>
                {loadingBest ? (
                  <Typography>Loading...</Typography>
                ) : bestCreative && bestCreative.message ? (
                  <Alert severity="info">{bestCreative.message}</Alert>
                ) : bestCreative ? (
                  <Paper sx={{ p: 2, mt: 1 }}>
                    <Typography><b>Headline:</b> {bestCreative.headline}</Typography>
                    <Typography><b>Description:</b> {bestCreative.description}</Typography>
                    <Typography><b>CVR:</b> {bestCreative.cvr}</Typography>
                    <Typography><b>Image:</b> <a href={bestCreative.image_url} target="_blank" rel="noopener noreferrer">{bestCreative.image_url}</a></Typography>
                  </Paper>
                ) : null}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTest(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 