import express from 'express'
import { supabase } from '../supabase'

const router = express.Router()

router.get('/', async (_, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')

  if (error) return res.status(500).json(error)
  res.json(data)
})

router.post('/', async (req, res) => {
  const { name, description, owner_id } = req.body

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description, owner_id })
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.json(data)
})

export default router
