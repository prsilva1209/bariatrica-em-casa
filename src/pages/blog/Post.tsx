import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Calendar, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';

interface BlogPost {
  title: string;
  content: string;
  author: string;
  created_at: string;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('title, content, author, created_at')
          .eq('slug', slug);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setPost(data[0]);
        } else {
          setPost(null);
        }

      } catch (error: any) {
        toast({
          title: "Erro ao carregar o post",
          description: error.message,
          variant: "destructive",
        });
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground ml-4">Carregando post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <p className="text-muted-foreground">O post que você está procurando não existe ou houve um erro.</p>
          <Link to="/blog" className="text-primary hover:underline mt-4 block">
            Voltar para o blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto p-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
          <div>
            <div className="mb-6">
              <Link to="/blog" className="text-sm text-muted-foreground flex items-center gap-1 hover:underline">
                <ChevronLeft className="w-4 h-4" />
                Voltar para o blog
              </Link>
            </div>
            <Card className="shadow-soft border-0">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-primary" />
                    <span>Por {post.author}</span>
                  </div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardContent>
            </Card>
          </div>

          <aside className="hidden md:block">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
