const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// GET /api/workflows — fetch all saved workflows
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    res.json({ workflows: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflows/:id — fetch a single workflow
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json({ workflow: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflows/:id/versions — fetch all versions of a workflow
router.get('/:id/versions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('workflow_id', req.params.id)
      .order('version_number', { ascending: false })

    if (error) throw error
    res.json({ versions: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workflows — save a new workflow
router.post('/', async (req, res) => {
  try {
    const { name, nodes, edges } = req.body

    if (!name || !nodes || !edges) {
      return res.status(400).json({ error: 'name, nodes and edges are required' })
    }

    // Create the workflow
    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert([{ name, nodes, edges }])
      .select()
      .single()

    if (error) throw error

    // Create the first version snapshot
    await supabase
      .from('workflow_versions')
      .insert([{
        workflow_id: workflow.id,
        version_number: 1,
        nodes,
        edges,
      }])

    res.json({ workflow })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/workflows/:id — update an existing workflow + create new version
router.put('/:id', async (req, res) => {
  try {
    const { name, nodes, edges } = req.body

    // Get the latest version number for this workflow
    const { data: versions, error: versionError } = await supabase
      .from('workflow_versions')
      .select('version_number')
      .eq('workflow_id', req.params.id)
      .order('version_number', { ascending: false })
      .limit(1)

    if (versionError) throw versionError

    const nextVersion = versions.length > 0 ? versions[0].version_number + 1 : 1

    // Update the workflow
    const { data: workflow, error } = await supabase
      .from('workflows')
      .update({ name, nodes, edges, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Save a new version snapshot
    await supabase
      .from('workflow_versions')
      .insert([{
        workflow_id: req.params.id,
        version_number: nextVersion,
        nodes,
        edges,
      }])

    res.json({ workflow, version: nextVersion })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workflows/:id/restore/:versionId — restore a previous version
router.post('/:id/restore/:versionId', async (req, res) => {
  try {
    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('id', req.params.versionId)
      .single()

    if (versionError) throw versionError

    // Get latest version number
    const { data: versions } = await supabase
      .from('workflow_versions')
      .select('version_number')
      .eq('workflow_id', req.params.id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersion = versions[0].version_number + 1

    // Update the workflow with the restored nodes/edges
    const { data: workflow, error } = await supabase
      .from('workflows')
      .update({
        nodes: version.nodes,
        edges: version.edges,
        updated_at: new Date()
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Save the restore as a new version
    await supabase
      .from('workflow_versions')
      .insert([{
        workflow_id: req.params.id,
        version_number: nextVersion,
        nodes: version.nodes,
        edges: version.edges,
      }])

    res.json({ workflow, restoredFrom: version.version_number })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/workflows/:id — delete a workflow
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router