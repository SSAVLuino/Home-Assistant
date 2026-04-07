router.get('/', withProject, async (req, res) => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('project_id', req.projectId)

  if (error) return res.status(500).json(error)
  res.json(data)
})

router.post('/', withProject, async (req, res) => {
  const { name, type, details } = req.body

  const { data, error } = await supabase
    .from('assets')
    .insert({
      project_id: req.projectId,
      name,
      type,
      details
    })
    .select()

  if (error) return res.status(500).json(error)
  res.json(data)
})
