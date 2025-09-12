import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PostSummary {
  title: string;
  slug: string;
}

const Sidebar = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('title, slug')
          .order('created_at', { ascending: false })
          .limit(5); // Limita a 5 posts para não sobrecarregar a barra lateral

        if (error) {
          throw error;
        }

        if (data) {
          setPosts(data);
        }
      } catch (error) {
        console.error('Erro ao carregar posts para a barra lateral:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.pathname]);

  return (
    <Card className="shadow-soft border-0 sticky top-4">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">Posts Recentes</h3>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="block text-primary-foreground hover:text-primary transition-colors font-semibold"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default Sidebar;
