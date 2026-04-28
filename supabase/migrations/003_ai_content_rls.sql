-- ============================================
-- AI-generated content RLS policies
-- Allows authenticated users to create content via /create page
-- ============================================

-- cards table
CREATE POLICY "Authenticated users insert cards" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users update ai cards" ON cards
  FOR UPDATE USING (id LIKE 'ai-%') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users delete ai cards" ON cards
  FOR DELETE USING (id LIKE 'ai-%');

-- paths table
CREATE POLICY "Authenticated users insert paths" ON paths
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users update ai paths" ON paths
  FOR UPDATE USING (id LIKE 'path-ai-%') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users delete ai paths" ON paths
  FOR DELETE USING (id LIKE 'path-ai-%');

-- path_nodes table
CREATE POLICY "Authenticated users insert path nodes" ON path_nodes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users delete ai path nodes" ON path_nodes
  FOR DELETE USING (path_id LIKE 'path-ai-%');

-- path_edges table
CREATE POLICY "Authenticated users insert path edges" ON path_edges
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users delete ai path edges" ON path_edges
  FOR DELETE USING (path_id LIKE 'path-ai-%');
