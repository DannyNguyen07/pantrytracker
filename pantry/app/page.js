'use client'
import { Box, Stack, Typography, Button, Modal, TextField } from "@mui/material";
import {firestore} from "@/firebase"
import {collection, query, doc, getDocs, setDoc, deleteDoc, getDoc} from "firebase/firestore"
import { useEffect, useState } from "react";
import CameraComponent from "./CameraComponent";
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};


export default function Home() {
  const [pantry, setPantry] = useState([])
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [itemName, setItemName] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);

  const updatePantry = async() => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({"name": doc.id, ...doc.data()})
    })
    console.log(pantryList)
    setPantry(pantryList)
    setFilteredPantry(pantryList);
  }

  useEffect(() => {
    updatePantry()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count + 1})
    }
    else{
      await setDoc(docRef, {count:1})
    }
    await updatePantry()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists())
    {
      const {count} = docSnap.data()
      if (count == 1)
      {
        await deleteDoc(docRef)
      }
      else
      {
        await setDoc(docRef, {count: count - 1})
      }
    }
    await updatePantry()
  }

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = pantry.filter(item => item.name.toLowerCase().includes(term.toLowerCase()));
    setFilteredPantry(filtered);
  }

  const handleCapture = (image) => {
    console.log("Captured image:", image);
    // Here you would process the image and add the item to the pantry
    handleCameraClose();
  }

  return <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent = {"center"}
      alignItems = {"center"}
      flexDirection={'column'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width = '100%' direction = 'row' spacing = {2}>
            <TextField 
              id = "outlined-basic" 
              label = 'Item' 
              variant = 'outlined' 
              fullWidth
              value = {itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant = 'outlined'
            onClick={() =>{
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={style}>
          <CameraComponent onCapture={handleCapture} />
        </Box>
      </Modal>

      <Box display="flex" alignItems="center" gap={1}>
        <TextField
          id="search"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ marginBottom: 2 }}
        />
        <Button variant="contained" onClick={handleCameraOpen}>
          <CameraAltIcon />
        </Button>
      </Box>
      
      <Button variant="contained" onClick={handleOpen}>
        Add
      </Button>
      <Box border = {'1px solid #333'}>
      <Box 
        width = "800px" 
        height = "75px" 
        bgcolor={'#ADD8E6'} 
        display={'flex'} 
        justifyContent={'center'} 
        alignContent={'center'} 
      >
        <Typography variant = "h2" color = {'#333'} textAlign={'center'}>
          Pantry Items
        </Typography>
      </Box>
      <Stack width = "800px" height = "300px" spacing = {2} overflow={'auto'}>
        {filteredPantry.map((item) => (
          <Box
            key = {item.name}
            width = "100%"
            minHeight = "150px"
            display = {'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
            paddingX = {5}
          >
            <Typography 
              variant = {'h3'}
              color = {'#333'}
              textAlign={'center'}
            >
              {
                item.name.charAt(0).toUpperCase() + item.name.slice(1)
              }
            </Typography>
            <Typography  variant = {'h3'} color = {'#333'}textAlign={'center'}>
              Quantity: {item.count}
            </Typography>
          <Button variant = 'contained' onClick = {() => removeItem(item.name)}>
            Remove
          </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
}
