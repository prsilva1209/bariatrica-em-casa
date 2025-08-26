import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    switch (tableName) {
      case 'workout_plans':
        return 'Planos de Treino';
      case 'exercises':
        return 'Exercícios';
      case 'user_roles':
        return 'Roles de Usuário';
      case 'profiles':
        return 'Perfis';
      default:
        return tableName;
    }
  };

  const getActionDisplayName = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'Criou';
      case 'UPDATE':
        return 'Atualizou';
      case 'DELETE':
        return 'Excluiu';
      default:
        return action;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesTable = tableFilter === 'all' || log.table_name === tableFilter;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const uniqueTables = Array.from(new Set(logs.map(log => log.table_name)));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 bg-gradient-primary rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Logs de Auditoria</h2>
        <p className="text-muted-foreground">
          Registro de todas as ações administrativas realizadas no sistema
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar nos logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="CREATE">Criar</SelectItem>
            <SelectItem value="UPDATE">Atualizar</SelectItem>
            <SelectItem value="DELETE">Excluir</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as tabelas</SelectItem>
            {uniqueTables.map((table) => (
              <SelectItem key={table} value={table}>
                {getTableDisplayName(table)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {logs.length === 0 
                ? 'Nenhum log de auditoria encontrado.'
                : 'Nenhum log corresponde aos filtros aplicados.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(log.action)}>
                        {getActionDisplayName(log.action)}
                      </Badge>
                      <span className="font-medium">{getTableDisplayName(log.table_name)}</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">ID do registro:</span> {log.record_id}
                      </p>
                      <p>
                        <span className="font-medium">Data:</span> {' '}
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </p>
                      <p>
                        <span className="font-medium">Usuário:</span> {log.user_id}
                      </p>
                    </div>

                    {(log.old_values || log.new_values) && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                          Ver detalhes das alterações
                        </summary>
                        <div className="mt-2 p-3 bg-muted/50 rounded text-xs">
                          {log.old_values && (
                            <div>
                              <strong>Valores anteriores:</strong>
                              <pre className="mt-1 text-muted-foreground">
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_values && (
                            <div className={log.old_values ? 'mt-2' : ''}>
                              <strong>Novos valores:</strong>
                              <pre className="mt-1 text-muted-foreground">
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;