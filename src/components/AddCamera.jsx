import React, { useState, useCallback } from 'react';
import './AddCamera.css';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDropzone } from 'react-dropzone';
import {
  Box, Button, TextField, Typography, Paper, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, IconButton, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const RichTextEditor = ({ onUpdate, content }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor',
      },
    },
  });

  return <EditorContent editor={editor} />;
};

const ImageUploader = ({ files, onFilesChange }) => {
  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  const removeFile = (fileToRemove) => {
    const newFiles = files.filter(file => file !== fileToRemove);
    onFilesChange(newFiles);
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? '#f0f0f0' : '#fafafa',
          mb: 2
        }}
      >
        <input {...getInputProps()} />
        <Typography>Drag & drop some files here, or click to select files</Typography>
      </Box>
      <Grid container spacing={2}>
        {files.map((file, index) => (
          <Grid item key={index} xs={4} sm={3} md={2}>
            <Paper sx={{ p: 1, position: 'relative', overflow: 'hidden' }}>
              <img src={file.preview} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
              <IconButton
                size="small"
                onClick={() => removeFile(file)}
                sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const AddCamera = ({ onCameraAdded }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [accessories, setAccessories] = useState([{ name: '', price: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpecField = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpecField = (index) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    setSpecs(newSpecs);
  };

  const handleAccessoryChange = (index, field, value) => {
    const newAccessories = [...accessories];
    newAccessories[index][field] = value;
    setAccessories(newAccessories);
  };

  const addAccessoryField = () => {
    setAccessories([...accessories, { name: '', price: '' }]);
  };

  const removeAccessoryField = (index) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !price || !company || files.length === 0) {
      setError('Please fill all required fields and upload at least one image.');
      return;
    }
    setLoading(true);

    try {
      const imageUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'camera_rental');
        const response = await fetch('https://api.cloudinary.com/v1_1/dnqxxqemt/image/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.secure_url) {
          imageUrls.push(data.secure_url);
        } else {
          throw new Error('An image upload failed.');
        }
      }

      const specsObject = specs.reduce((obj, item) => {
        if (item.key) obj[item.key] = item.value;
        return obj;
      }, {});

      await addDoc(collection(db, 'cameras'), {
        name,
        price,
        description,
        imageUrls,
        specs: specsObject,
        accessories,
        company,
        createdAt: Timestamp.now(),
      });

      setName('');
      setPrice(0);
      setDescription('');
      setFiles([]);
      setSpecs([{ key: '', value: '' }]);
      setAccessories([{ name: '', price: '' }]);
      if (onCameraAdded) onCameraAdded();

    } catch (err) {
      console.error('Error adding camera:', err);
      setError('Failed to add camera. ' + (err.message || 'Please try again.'));
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto', mt: 6, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight={800}>
        Add New Camera
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <TextField
          label="Camera Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormControl fullWidth required>
          <InputLabel id="company-select-label">Company</InputLabel>
          <Select
            labelId="company-select-label"
            id="company-select"
            value={company}
            label="Company"
            onChange={(e) => setCompany(e.target.value)}
          >
            <MenuItem value="Nikon">Nikon</MenuItem>
            <MenuItem value="Canon">Canon</MenuItem>
            <MenuItem value="Sony">Sony</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Daily Rate ($)"
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          required
        />
        <Box>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <RichTextEditor onUpdate={setDescription} content={description} />
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom>Images</Typography>
          <ImageUploader files={files} onFilesChange={setFiles} />
        </Box>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Technical Specifications</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {specs.map((spec, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={5}>
                  <TextField label="Property (e.g., Sensor)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={5}>
                  <TextField label="Value (e.g., Full-Frame)" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={() => removeSpecField(index)}><DeleteIcon /></IconButton>
                </Grid>
              </Grid>
            ))}
            <Button startIcon={<AddIcon />} onClick={addSpecField}>
              Add Spec
            </Button>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Accessories</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {accessories.map((accessory, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Accessory Name"
                  value={accessory.name}
                  onChange={e => handleAccessoryChange(index, 'name', e.target.value)}
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Price ($)"
                  type="number"
                  value={accessory.price}
                  onChange={e => handleAccessoryChange(index, 'price', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={() => removeAccessoryField(index)} disabled={accessories.length === 1}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addAccessoryField} sx={{ mt: 1, width: 'fit-content' }}>
              Add Accessory
            </Button>
          </AccordionDetails>
        </Accordion>

        {error && <Typography color="error" align="center">{error}</Typography>}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: '#FF6B6B',
            color: '#fff',
            '&:hover': { bgcolor: '#e55a5a' },
            p: 1.5
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Camera'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCamera; 