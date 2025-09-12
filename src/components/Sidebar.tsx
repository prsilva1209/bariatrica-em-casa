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
          .limit(5);

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

  // Extrai o slug atual para destacar o item ativo
  const currentSlug = location.pathname.split('/').pop();

  return (
    <Card className="sticky top-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-shadow">
      <CardContent className="p-6">
        <h3 className="text-xl font-extrabold mb-5 border-b border-gray-300 dark:border-gray-600 pb-3 text-gray-900 dark:text-gray-100">
          Posts Recentes
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="space-y-5">
            {posts.map((post) => {
              const isActive = currentSlug === post.slug;
              return (
                <li key={post.slug}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className={`block px-3 py-2 rounded-md font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-primary hover:bg-primary hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {post.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default Sidebar;
