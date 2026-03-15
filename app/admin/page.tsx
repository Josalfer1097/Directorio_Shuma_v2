"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  Lock,
  LogIn,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import employeesData from "@/data/employees.json";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-lg border border-border bg-muted/50 flex items-center justify-center">
      <p className="text-muted-foreground">Cargando editor...</p>
    </div>
  ),
});

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(employeesData, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        toast.success("Acceso concedido");
      } else {
        toast.error(data.error || "Contraseña incorrecta");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonChange = (value: string | undefined) => {
    if (value !== undefined) {
      setJsonContent(value);
      try {
        JSON.parse(value);
        setJsonError(null);
      } catch (e) {
        setJsonError("JSON inválido: " + (e as Error).message);
      }
    }
  };

  const downloadJson = () => {
    try {
      const data = JSON.parse(jsonContent);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `employees_backup_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Archivo descargado");
    } catch (e) {
      toast.error("Error al descargar: JSON inválido");
    }
  };

  const handleCsvUpload = useCallback(
    (file: File) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const currentData = JSON.parse(jsonContent);
            const newEmployees = results.data.map((row: any, index: number) => ({
              id: row.id || `emp${Date.now()}${index}`,
              name: row.name || row.nombre || "",
              position: row.position || row.puesto || "",
              department: row.department || row.departamento || "",
              company: row.company || row.empresa || "grupo-shuma",
              email: row.email || row.correo || "",
              phone: row.phone || row.telefono || "",
              extension: row.extension || "",
              reportsTo: row.reportsTo || row.reporta_a || null,
              avatar: null,
              tags: row.tags
                ? row.tags.split(",").map((t: string) => t.trim())
                : [],
              startDate:
                row.startDate ||
                row.fecha_ingreso ||
                new Date().toISOString().split("T")[0],
            }));

            // Merge with existing employees (update existing, add new)
            const existingIds = new Set(
              currentData.employees.map((e: any) => e.id)
            );
            const updatedEmployees = [...currentData.employees];

            newEmployees.forEach((newEmp: any) => {
              const existingIndex = updatedEmployees.findIndex(
                (e: any) => e.id === newEmp.id
              );
              if (existingIndex >= 0) {
                updatedEmployees[existingIndex] = newEmp;
              } else {
                updatedEmployees.push(newEmp);
              }
            });

            currentData.employees = updatedEmployees;
            setJsonContent(JSON.stringify(currentData, null, 2));
            setJsonError(null);
            toast.success(
              `${newEmployees.length} empleados importados correctamente`
            );
          } catch (e) {
            toast.error("Error al procesar el archivo CSV");
          }
        },
        error: () => {
          toast.error("Error al leer el archivo CSV");
        },
      });
    },
    [jsonContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === "text/csv") {
        handleCsvUpload(file);
      } else {
        toast.error("Por favor, sube un archivo CSV");
      }
    },
    [handleCsvUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCsvUpload(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Acceso Administrador</CardTitle>
                  <CardDescription>
                    Ingresa la contraseña para acceder al panel de administración
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Ingresa la contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                      <LogIn className="w-4 h-4" />
                      {isLoading ? "Verificando..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground">
              Edita el directorio de empleados directamente en formato JSON o
              importa datos desde un archivo CSV
            </p>
          </motion.div>

          <Tabs defaultValue="editor" className="space-y-6">
            <TabsList>
              <TabsTrigger value="editor" className="gap-2">
                <FileJson className="w-4 h-4" />
                Editor JSON
              </TabsTrigger>
              <TabsTrigger value="import" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Importar CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              {/* JSON Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Editor de Datos</CardTitle>
                      <CardDescription>
                        Edita el archivo employees.json directamente
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={downloadJson}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {jsonError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error de sintaxis</AlertTitle>
                      <AlertDescription>{jsonError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="rounded-lg overflow-hidden border border-border">
                    <Editor
                      height="500px"
                      defaultLanguage="json"
                      value={jsonContent}
                      onChange={handleJsonChange}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                    />
                  </div>

                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Nota importante</AlertTitle>
                    <AlertDescription>
                      Los cambios realizados en este editor no se guardan
                      automáticamente en el servidor. Para aplicar los cambios
                      permanentemente, descarga el archivo JSON y reemplaza el
                      archivo /data/employees.json en el repositorio.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Importar desde CSV</CardTitle>
                  <CardDescription>
                    Sube un archivo CSV para importar empleados en lote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground mb-2">
                      Arrastra y suelta tu archivo CSV aquí
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload">
                      <Button variant="outline" asChild>
                        <span>Seleccionar archivo</span>
                      </Button>
                    </label>
                  </div>

                  {/* CSV Format guide */}
                  <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-foreground mb-2">
                      Formato del CSV
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      El archivo CSV debe incluir las siguientes columnas:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-foreground">
                              Columna
                            </th>
                            <th className="text-left py-2 px-3 text-foreground">
                              Descripción
                            </th>
                            <th className="text-left py-2 px-3 text-foreground">
                              Requerido
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">name</td>
                            <td className="py-2 px-3">Nombre completo</td>
                            <td className="py-2 px-3">
                              <Check className="w-4 h-4 text-green-500" />
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">position</td>
                            <td className="py-2 px-3">Puesto</td>
                            <td className="py-2 px-3">
                              <Check className="w-4 h-4 text-green-500" />
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">department</td>
                            <td className="py-2 px-3">Departamento</td>
                            <td className="py-2 px-3">
                              <Check className="w-4 h-4 text-green-500" />
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">company</td>
                            <td className="py-2 px-3">ID de la empresa</td>
                            <td className="py-2 px-3">
                              <Check className="w-4 h-4 text-green-500" />
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">email</td>
                            <td className="py-2 px-3">Correo electrónico</td>
                            <td className="py-2 px-3">
                              <Check className="w-4 h-4 text-green-500" />
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">phone</td>
                            <td className="py-2 px-3">Teléfono</td>
                            <td className="py-2 px-3">Opcional</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">extension</td>
                            <td className="py-2 px-3">Extensión telefónica</td>
                            <td className="py-2 px-3">Opcional</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono">reportsTo</td>
                            <td className="py-2 px-3">ID del supervisor</td>
                            <td className="py-2 px-3">Opcional</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono">tags</td>
                            <td className="py-2 px-3">
                              Etiquetas separadas por coma
                            </td>
                            <td className="py-2 px-3">Opcional</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Company IDs reference */}
                  <div className="mt-4 p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-foreground mb-2">
                      IDs de Empresas
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "#7C3AED" }}
                        />
                        <span className="text-muted-foreground">
                          grupo-shuma
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "#2563EB" }}
                        />
                        <span className="text-muted-foreground">
                          comercializadora-shuma
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "#D97706" }}
                        />
                        <span className="text-muted-foreground">
                          acabados-shuma
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "#DC2626" }}
                        />
                        <span className="text-muted-foreground">
                          ferrecapital
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "#16A34A" }}
                        />
                        <span className="text-muted-foreground">
                          arkiramica
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
