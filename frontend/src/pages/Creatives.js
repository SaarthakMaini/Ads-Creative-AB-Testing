import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';

export default function Creatives() {
  const [creatives, setCreatives] = useState([]);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const fetchCreatives = async () => {
    try {
      const res = await api.get('/creatives/');
      setCreatives(res.data);
    } catch (err) {
      setError('Failed to fetch creatives');
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

  useEffect(() => {
    fetchCreatives();
    fetchProducts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/creatives/', {
        product_id: Number(productId),
        image_url: imageUrl,
        headline,
        description,
      });
      setProductId('');
      setImageUrl('');
      setHeadline('');
      setDescription('');
      fetchCreatives();
    } catch (err) {
      setError('Failed to add creative');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/creatives/${id}`);
      fetchCreatives();
    } catch (err) {
      setError('Failed to delete creative');
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>Creatives</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleAdd} mb={4}>
        <FormControl sx={{ mr: 2, minWidth: 120 }} required>
          <InputLabel>Product</InputLabel>
          <Select value={productId} label="Product" onChange={e => setProductId(e.target.value)}>
            {products.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required sx={{ mr: 2 }} />
        <TextField label="Headline" value={headline} onChange={e => setHeadline(e.target.value)} required sx={{ mr: 2 }} />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} required sx={{ mr: 2 }} />
        <Button type="submit" variant="contained">Add Creative</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Headline</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {creatives.map((creative) => (
              <TableRow key={creative.id}>
                <TableCell>{creative.id}</TableCell>
                <TableCell>{products.find(p => p.id === creative.product_id)?.title || creative.product_id}</TableCell>
                <TableCell><a href={creative.image_url} target="_blank" rel="noopener noreferrer">{creative.image_url}</a></TableCell>
                <TableCell>{creative.headline}</TableCell>
                <TableCell>{creative.description}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(creative.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 