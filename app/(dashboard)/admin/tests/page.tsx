"use client";

import { useState } from "react";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, ClipboardList, Clock, Users, Trash2, Eye, EyeOff, Upload, FileText, AlertCircle, CheckCircle, BarChart3 } from "lucide-react";
import Link from "next/link";

interface MCQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
}

// Sample format for bulk import
const BULK_IMPORT_EXAMPLE = `Q1. What is the SI unit of force?
A) Newton
B) Joule
C) Watt
D) Pascal
Answer: A

Q2. Which of the following is a vector quantity?
A) Speed
B) Mass
C) Velocity
D) Time
Answer: C

Q3. The value of acceleration due to gravity is approximately?
A) 8.9 m/s²
B) 9.8 m/s²
C) 10.8 m/s²
D) 7.8 m/s²
Answer: B

Q4. Ohm's law relates voltage, current and?
A) Power
B) Resistance
C) Capacitance
D) Inductance
Answer: B

Q5. The chemical formula of water is?
A) H2O2
B) CO2
C) H2O
D) NaCl
Answer: C`;

// Parse bulk questions from text
function parseBulkQuestions(text: string): MCQuestion[] {
  const questions: MCQuestion[] = [];
  
  // Split by double newlines or question number patterns
  const blocks = text.split(/\n\s*\n/).filter(block => block.trim());
  
  for (const block of blocks) {
    try {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 4) continue;
      
      // Extract question (first line, remove Q1. or 1. prefix)
      let questionText = lines[0]
        .replace(/^Q\d+[.\s):]*/i, '')
        .replace(/^\d+[.\s):]*/i, '')
        .replace(/^Question\s*\d*[.\s):]*/i, '')
        .trim();
      
      // If question text is empty, might be multi-line, take next line
      if (!questionText && lines.length > 1) {
        questionText = lines[1];
      }
      
      // Find options and answer
      let optionA = '', optionB = '', optionC = '', optionD = '';
      let correctOption = '';
      
      for (const line of lines) {
        const cleanLine = line.trim();
        
        // Match options like "A)" "A." "A:" "(A)" or "a)"
        if (/^[\(\[]?[Aa][\)\].\s:]+/.test(cleanLine)) {
          optionA = cleanLine.replace(/^[\(\[]?[Aa][\)\].\s:]+\s*/i, '').trim();
        } else if (/^[\(\[]?[Bb][\)\].\s:]+/.test(cleanLine)) {
          optionB = cleanLine.replace(/^[\(\[]?[Bb][\)\].\s:]+\s*/i, '').trim();
        } else if (/^[\(\[]?[Cc][\)\].\s:]+/.test(cleanLine)) {
          optionC = cleanLine.replace(/^[\(\[]?[Cc][\)\].\s:]+\s*/i, '').trim();
        } else if (/^[\(\[]?[Dd][\)\].\s:]+/.test(cleanLine)) {
          optionD = cleanLine.replace(/^[\(\[]?[Dd][\)\].\s:]+\s*/i, '').trim();
        }
        
        // Find answer - multiple patterns
        // "Answer: A", "Ans: B", "Correct Answer: C", "Answer - D", "**Answer: A**"
        const answerPatterns = [
          /(?:Answer|Ans|Correct\s*Answer|Correct)\s*[:\-=>\s]+\s*[\(\[]?([ABCDabcd])[\)\]]?/i,
          /\*\*(?:Answer|Ans)[:\s]*([ABCDabcd])\*\*/i,
          /(?:Answer|Ans)\s*[:\-]\s*(?:Option\s*)?([ABCDabcd])/i,
          /^\s*([ABCDabcd])\s*(?:is\s+)?(?:correct|right|answer)/i,
        ];
        
        for (const pattern of answerPatterns) {
          const match = cleanLine.match(pattern);
          if (match) {
            correctOption = match[1].toUpperCase();
            break;
          }
        }
      }
      
      // Default to A only if no answer found
      if (!correctOption) {
        correctOption = 'A';
      }
      
      // Only add if we have question and all options
      if (questionText && optionA && optionB && optionC && optionD) {
        questions.push({
          question: questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
          marks: 1,
        });
      }
    } catch (e) {
      console.error('Failed to parse question block:', block);
    }
  }
  
  return questions;
}

interface Test {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  showRanking: boolean;
  active: boolean;
  subject: { id: string; name: string };
  creator: { id: string; name: string };
  _count: { questions: number; attempts: number };
}

interface Subject {
  id: string;
  name: string;
}

export default function TestsPage() {
  const { data: testsData, loading, refetch: refetchTests } = useCachedFetch<Test[]>("/api/tests");
  const { data: subjectsData } = useCachedFetch<Subject[]>("/api/subjects");
  const tests = testsData || [];
  const subjects = subjectsData || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    duration: "30",
    showRanking: false,
    marksPerQuestion: "1",
  });

  const [questions, setQuestions] = useState<MCQuestion[]>([
    { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 },
  ]);

  const [bulkText, setBulkText] = useState("");
  const [importMode, setImportMode] = useState<"manual" | "bulk">("bulk");
  const [parsePreview, setParsePreview] = useState<MCQuestion[]>([]);

  const fetchTests = () => refetchTests();
  const fetchSubjects = () => {};

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof MCQuestion, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  // Parse bulk text and show preview
  const handleBulkParse = () => {
    const parsed = parseBulkQuestions(bulkText);
    if (parsed.length === 0) {
      toast({
        title: "No questions found",
        description: "Please check the format and try again",
        variant: "destructive",
      });
      return;
    }
    
    // Apply marks per question
    const marksValue = parseInt(formData.marksPerQuestion) || 1;
    const questionsWithMarks = parsed.map(q => ({ ...q, marks: marksValue }));
    
    setParsePreview(questionsWithMarks);
    toast({
      title: `${questionsWithMarks.length} questions parsed!`,
      description: "Review them below and click 'Use These Questions' to confirm",
    });
  };

  // Use parsed questions
  const useParsedQuestions = () => {
    if (parsePreview.length === 0) return;
    setQuestions(parsePreview);
    setParsePreview([]);
    setBulkText("");
    setImportMode("manual");
    toast({ title: "Questions imported!", description: `${parsePreview.length} questions ready` });
  };

  // Calculate total marks
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate questions
    const invalidQ = questions.find(
      (q) => !q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD
    );
    if (invalidQ) {
      toast({
        title: "Error",
        description: "Please fill all question fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, questions }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Test created successfully" });
        setDialogOpen(false);
        setFormData({ title: "", description: "", subjectId: "", duration: "30", showRanking: false, marksPerQuestion: "1" });
        setQuestions([{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 }]);
        fetchTests();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create test",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleRanking = async (testId: string, showRanking: boolean) => {
    try {
      const response = await fetch("/api/tests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testId, showRanking }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }
      fetchTests();
      toast({ title: "Updated", description: showRanking ? "Rankings enabled" : "Rankings hidden" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/tests?id=${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }
      toast({ title: "Deleted", description: "Test deleted successfully" });
      fetchTests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete test",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 bg-stone-950 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mock Tests</h1>
          <p className="text-stone-400 mt-1">Create and manage assessments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Mock Test</DialogTitle>
                <DialogDescription>Create a new MCQ test for students - supports bulk import from AI</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Test Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Test Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Mathematics Full Test - 50 Marks"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select
                      value={formData.subjectId}
                      onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (mins) *</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Marks per Question</Label>
                    <Input
                      type="number"
                      value={formData.marksPerQuestion}
                      onChange={(e) => setFormData({ ...formData, marksPerQuestion: e.target.value })}
                      min="1"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.showRanking}
                      onCheckedChange={(checked) => setFormData({ ...formData, showRanking: checked })}
                    />
                    <Label className="text-sm">Show Rankings</Label>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-4 pt-6">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {questions.length} Questions
                    </Badge>
                    <Badge className="bg-amber-900/30 text-amber-400 border border-amber-700/30 text-lg px-4 py-2">
                      Total: {totalMarks} Marks
                    </Badge>
                  </div>
                </div>

                {/* Questions Section with Tabs */}
                <div className="border-t border-amber-900/20 pt-4">
                  <Tabs value={importMode} onValueChange={(v) => setImportMode(v as "manual" | "bulk")}>
                    <div className="flex items-center justify-between mb-4">
                      <TabsList>
                        <TabsTrigger value="bulk" className="gap-2">
                          <Upload className="w-4 h-4" />
                          Bulk Import (Easy)
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Manual Entry
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Bulk Import Tab */}
                    <TabsContent value="bulk" className="space-y-4">
                      <div className="bg-amber-900/15 border border-amber-900/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-white mb-2">How to use Bulk Import:</p>
                            <ol className="list-decimal list-inside space-y-1 text-stone-400">
                              <li>Ask AI (ChatGPT/Gemini) to generate MCQ questions in this format</li>
                              <li>Copy all questions and paste them below</li>
                              <li>Click &quot;Parse Questions&quot; to preview</li>
                              <li>Click &quot;Use These Questions&quot; to import</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Paste Questions Here</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setBulkText(BULK_IMPORT_EXAMPLE)}
                          >
                            Load Example
                          </Button>
                        </div>
                        <Textarea
                          value={bulkText}
                          onChange={(e) => setBulkText(e.target.value)}
                          placeholder={`Paste your questions here in this format:\n\nQ1. What is the capital of Karnataka?\nA) Mumbai\nB) Bengaluru\nC) Chennai\nD) Hyderabad\nAnswer: B\n\nQ2. Next question...\nA) Option 1\n...`}
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button type="button" onClick={handleBulkParse} disabled={!bulkText.trim()}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Parse Questions
                        </Button>
                        {parsePreview.length > 0 && (
                          <Button type="button" variant="default" className="bg-green-600 hover:bg-green-700" onClick={useParsedQuestions}>
                            Use These {parsePreview.length} Questions
                          </Button>
                        )}
                      </div>

                      {/* Preview parsed questions */}
                      {parsePreview.length > 0 && (
                        <div className="border rounded-lg p-4 bg-green-900/15">
                          <h4 className="font-semibold text-green-400 mb-3">
                            Preview: {parsePreview.length} questions parsed successfully
                          </h4>
                          <div className="max-h-60 overflow-y-auto space-y-3">
                            {parsePreview.map((q, i) => (
                              <div key={i} className="bg-stone-900 p-3 rounded border border-amber-900/15 text-sm">
                                <p className="font-medium text-white">Q{i + 1}. {q.question}</p>
                                <div className="grid grid-cols-2 gap-1 mt-2 text-stone-400">
                                  <span className={q.correctOption === 'A' ? 'text-green-600 font-medium' : ''}>A) {q.optionA}</span>
                                  <span className={q.correctOption === 'B' ? 'text-green-600 font-medium' : ''}>B) {q.optionB}</span>
                                  <span className={q.correctOption === 'C' ? 'text-green-600 font-medium' : ''}>C) {q.optionC}</span>
                                  <span className={q.correctOption === 'D' ? 'text-green-600 font-medium' : ''}>D) {q.optionD}</span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">Answer: {q.correctOption} | Marks: {q.marks}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Manual Entry Tab */}
                    <TabsContent value="manual" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Questions ({questions.length})</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Question
                        </Button>
                      </div>

                      <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                        {questions.map((q, index) => (
                          <Card key={index} className="border border-amber-900/15 bg-stone-900 shadow-sm">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Question {index + 1}</Label>
                                {questions.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-400"
                                    onClick={() => removeQuestion(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <Textarea
                                value={q.question}
                                onChange={(e) => updateQuestion(index, "question", e.target.value)}
                                placeholder="Enter the question..."
                                rows={2}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium w-6">A)</span>
                                  <Input
                                    value={q.optionA}
                                    onChange={(e) => updateQuestion(index, "optionA", e.target.value)}
                                    placeholder="Option A"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium w-6">B)</span>
                                  <Input
                                    value={q.optionB}
                                    onChange={(e) => updateQuestion(index, "optionB", e.target.value)}
                                    placeholder="Option B"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium w-6">C)</span>
                                  <Input
                                    value={q.optionC}
                                    onChange={(e) => updateQuestion(index, "optionC", e.target.value)}
                                    placeholder="Option C"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium w-6">D)</span>
                                  <Input
                                    value={q.optionD}
                                    onChange={(e) => updateQuestion(index, "optionD", e.target.value)}
                                    placeholder="Option D"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <Label className="text-xs">Correct Answer</Label>
                                  <Select
                                    value={q.correctOption}
                                    onValueChange={(v) => updateQuestion(index, "correctOption", v)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="A">Option A</SelectItem>
                                      <SelectItem value="B">Option B</SelectItem>
                                      <SelectItem value="C">Option C</SelectItem>
                                      <SelectItem value="D">Option D</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-24">
                                  <Label className="text-xs">Marks</Label>
                                  <Input
                                    type="number"
                                    value={q.marks}
                                    onChange={(e) => updateQuestion(index, "marks", parseInt(e.target.value) || 1)}
                                    min="1"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <div className="flex-1 text-left">
                  <Badge variant="outline" className="text-base">
                    Total: {questions.length} Qs × {totalMarks} Marks
                  </Badge>
                </div>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || questions.length === 0 || !questions[0].question}>
                  {saving ? "Creating..." : `Create Test (${totalMarks} Marks)`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-500">Loading tests...</p>
        </div>
      ) : tests.length === 0 ? (
        <Card className="border border-amber-900/15 bg-stone-900 shadow-md">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tests Yet</h3>
            <p className="text-stone-400">Create your first mock test to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="border border-amber-900/15 bg-stone-900 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{test.title}</CardTitle>
                    <p className="text-sm text-amber-500">{test.subject.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {test.duration} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    {test._count.questions} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {test._count.attempts} attempts
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-amber-900/20">
                  <span className="text-sm text-stone-400">Show Rankings</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRanking(test.id, !test.showRanking)}
                  >
                    {test.showRanking ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-stone-500" />
                    )}
                  </Button>
                </div>
                {/* View Results Button */}
                <Link href={`/admin/tests/results?testId=${test.id}`}>
                  <Button variant="outline" className="w-full mt-3" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Student Results ({test._count.attempts})
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
