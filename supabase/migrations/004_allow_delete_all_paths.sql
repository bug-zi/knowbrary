-- Allow authenticated users to delete any path (not just AI-generated ones)
-- Previous policy only allowed deleting paths with id LIKE 'path-ai-%',
-- which blocked deletion of seed data paths like 'path-psychology-001'

DROP POLICY IF EXISTS "Authenticated users delete ai paths" ON paths;
CREATE POLICY "Authenticated users delete paths" ON paths
  FOR DELETE USING (auth.role() = 'authenticated');

-- Also allow deleting path_nodes and path_edges for any path (not just AI paths)
DROP POLICY IF EXISTS "Authenticated users delete ai path nodes" ON path_nodes;
CREATE POLICY "Authenticated users delete path nodes" ON path_nodes
  FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users delete ai path edges" ON path_edges;
CREATE POLICY IF EXISTS "Authenticated users delete path edges" ON path_edges
  FOR DELETE USING (auth.role() = 'authenticated');
