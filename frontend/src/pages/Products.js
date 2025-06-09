import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/products/', {
        title,
        description,
        images: images.split(',').map(img => img.trim()),
      });
      setTitle('');
      setDescription('');
      setImages('');
      fetchProducts();
    } catch (err) {
      setError('Failed to add product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>Products</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleAdd} mb={4}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required sx={{ mr: 2 }} />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} required sx={{ mr: 2 }} />
        <TextField label="Images (comma separated URLs)" value={images} onChange={e => setImages(e.target.value)} sx={{ mr: 2, width: 300 }} />
        <Button type="submit" variant="contained">Add Product</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.images.join(', ')}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(product.id)}>
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