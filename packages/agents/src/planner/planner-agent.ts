import type {
  AgentId,
  TaskPlan,
  TaskNode,
  PlanComplexity,
  TaskPriority,
  WorkbookSnapshot,
} from "@mona/schema";
import { BaseAgent } from "../base";
import { PLANNER_SYSTEM_PROMPT } from "./prompts";

export interface PlannerContext {
  readonly snapshot?: WorkbookSnapshot;
  readonly activeSheetName?: string;
  readonly selectedRange?: string;
  readonly headers?: string[];
  readonly hasData?: boolean;
}

export interface IntentScores {
  formula: number;
  cleaning: number;
  chart: number;
  insight: number;
  automation: number;
  sql: number;
  python: number;
}

export class PlannerAgent extends BaseAgent {
  readonly id: AgentId = "planner";
  readonly name = "Mona Planner Agent";
  readonly description =
    "Production-grade, multi-agent DAG planner. Performs intent scoring, context analysis, task decomposition, dependency building, and parallel execution optimization.";
  readonly systemPrompt = PLANNER_SYSTEM_PROMPT;
  readonly tools = ["read_cells", "get_sheet_list", "get_workbook_info"];

  /**
   * Main entry point: Performs full multi-stage planning pipeline.
   */
  createPlan(userRequest: string, plannerCtx?: PlannerContext): TaskPlan {
    const text = userRequest.trim();

    // 1. Analyze Intent Scores across specialists
    const scores = this.analyseIntent(text);

    // 2. Determine Primary Intent & Complexity
    const primaryIntent = this.determinePrimaryIntent(scores);
    
    // 3. Check for Clarification Needs
    const clarification = this.checkClarification(text, plannerCtx);

    // 4. Decompose into Atomic Tasks
    const tasks = this.decomposeTasks(text, scores, plannerCtx);

    // 5. Build Dependency Graph (DAG)
    this.buildDependencies(tasks);

    // 6. Optimize Execution Order & Parallel Groups
    const { executionOrder, parallelGroups } = this.optimiseExecution(tasks);

    // 7. Estimate Complexity
    const complexity = this.estimateComplexity(tasks);

    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userRequest: text,
      intent: primaryIntent,
      complexity,
      tasks,
      executionOrder,
      parallelGroups,
      clarificationNeeded: clarification.needed,
      clarificationQuestion: clarification.question,
      createdAt: new Date(),
    };
  }

  // ── Stage 1: Intent Analysis ────────────────────────────────────────

  private analyseIntent(request: string): IntentScores {
    const lower = request.toLowerCase();
    const scores: IntentScores = {
      formula: 0,
      cleaning: 0,
      chart: 0,
      insight: 0,
      automation: 0,
      sql: 0,
      python: 0,
    };

    // Cleaning keywords & patterns
    if (/\b(clean|duplicates?|remove|trim|whitespace|fix|format|empty|blank|delete row|drop|sort|filter|split|merge)\b/.test(lower)) {
      scores.cleaning += 10;
    }

    // Formula keywords & patterns
    if (/\b(formula|calculate|sum|average|vlookup|xlookup|count|percentage|total|revenue|profit|margin|subtotal|math|multiply|ratio)\b/.test(lower)) {
      scores.formula += 10;
    }

    // Chart & Dashboard keywords
    if (/\b(chart|graph|plot|dashboard|visualize|bar|line|pie|donut|histogram|scatter|kpi|heatmap|sparkline)\b/.test(lower)) {
      scores.chart += 10;
    }

    // Insight & Analysis keywords
    if (/\b(insight|analyze|analysis|summary|summarize|trend|pattern|outlier|top|bottom|highest|lowest|overview|report)\b/.test(lower)) {
      scores.insight += 10;
    }

    // Automation & Macros
    if (/\b(automate|workflow|script|schedule|trigger|repeat|batch)\b/.test(lower)) {
      scores.automation += 8;
    }

    // SQL / Python
    if (/\b(sql|query|select|where|group by)\b/.test(lower)) {
      scores.sql += 10;
    }
    if (/\b(python|pandas|numpy|script|model|predict)\b/.test(lower)) {
      scores.python += 10;
    }

    return scores;
  }

  private determinePrimaryIntent(scores: IntentScores): string {
    const sorted = (Object.keys(scores) as (keyof IntentScores)[])
      .map((k) => ({ agent: k, score: scores[k] }))
      .sort((a, b) => b.score - a.score);

    const activeIntents = sorted.filter((s) => s.score > 0).map((s) => s.agent);
    if (activeIntents.length === 0) return "general_query";
    return activeIntents.join(" + ");
  }

  // ── Stage 2: Task Decomposition ────────────────────────────────────

  private decomposeTasks(
    request: string,
    scores: IntentScores,
    _plannerCtx?: PlannerContext
  ): TaskNode[] {
    const tasks: TaskNode[] = [];
    let taskIdCounter = 1;

    // Helper to generate task IDs
    const nextId = () => `task_${taskIdCounter++}`;

    // Step 1: Cleaning Task (if requested)
    if (scores.cleaning > 0) {
      tasks.push({
        id: nextId(),
        title: "Clean & Format Data",
        description: "Sanitize data, remove duplicates, trim whitespace, and standardize headers/ranges.",
        agentId: "cleaning",
        status: "pending",
        priority: "high",
        estimatedDuration: 1500,
        dependencies: [],
      });
    }

    // Step 2: Formula Task (if requested)
    if (scores.formula > 0) {
      tasks.push({
        id: nextId(),
        title: "Compute Formulas & Metrics",
        description: "Calculate numerical totals, averages, lookups, and financial metrics.",
        agentId: "formula",
        status: "pending",
        priority: "high",
        estimatedDuration: 2000,
        dependencies: [],
      });
    }

    // Step 3: Insight Task (if requested)
    if (scores.insight > 0) {
      tasks.push({
        id: nextId(),
        title: "Generate Data Insights & Trends",
        description: "Analyze patterns, high/low points, and construct summary insights.",
        agentId: "insight",
        status: "pending",
        priority: "medium",
        estimatedDuration: 2500,
        dependencies: [],
      });
    }

    // Step 4: Chart Task (if requested)
    if (scores.chart > 0) {
      tasks.push({
        id: nextId(),
        title: "Create Visual Charts & Dashboard",
        description: "Generate charts, KPI components, and dashboard elements.",
        agentId: "chart",
        status: "pending",
        priority: "medium",
        estimatedDuration: 3000,
        dependencies: [],
      });
    }

    // Fallback: If no specialist triggered, assign to formula agent
    if (tasks.length === 0) {
      tasks.push({
        id: nextId(),
        title: "Process Request",
        description: request,
        agentId: "formula",
        status: "pending",
        priority: "medium",
        estimatedDuration: 2000,
        dependencies: [],
      });
    }

    return tasks;
  }

  // ── Stage 3: Dependency Graph Building (DAG) ────────────────────────

  private buildDependencies(tasks: TaskNode[]): void {
    // Standard pipeline order: cleaning -> formula -> insight -> chart
    const findByAgent = (agentId: AgentId) => tasks.find((t) => t.agentId === agentId);

    const cleaningTask = findByAgent("cleaning");
    const formulaTask = findByAgent("formula");
    const insightTask = findByAgent("insight");
    const chartTask = findByAgent("chart");

    if (cleaningTask && formulaTask) {
      (formulaTask.dependencies as string[]).push(cleaningTask.id);
    }

    if (formulaTask && insightTask) {
      (insightTask.dependencies as string[]).push(formulaTask.id);
    } else if (cleaningTask && insightTask) {
      (insightTask.dependencies as string[]).push(cleaningTask.id);
    }

    if (insightTask && chartTask) {
      (chartTask.dependencies as string[]).push(insightTask.id);
    } else if (formulaTask && chartTask) {
      (chartTask.dependencies as string[]).push(formulaTask.id);
    } else if (cleaningTask && chartTask) {
      (chartTask.dependencies as string[]).push(cleaningTask.id);
    }
  }

  // ── Stage 4: Parallel Execution & Topological Ordering ─────────────

  private optimiseExecution(tasks: TaskNode[]): {
    executionOrder: string[];
    parallelGroups: string[][];
  } {
    const executionOrder: string[] = [];
    const parallelGroups: string[][] = [];
    const visited = new Set<string>();

    const remaining = [...tasks];

    while (remaining.length > 0) {
      // Find all tasks whose dependencies are satisfied in current visited set
      const readyTier = remaining.filter((t) =>
        t.dependencies.every((depId) => visited.has(depId))
      );

      if (readyTier.length === 0) {
        // Break potential cycle by taking first task
        const forced = remaining.shift()!;
        visited.add(forced.id);
        executionOrder.push(forced.id);
        parallelGroups.push([forced.id]);
        continue;
      }

      const tierIds = readyTier.map((t) => t.id);
      tierIds.forEach((id) => visited.add(id));
      executionOrder.push(...tierIds);
      parallelGroups.push(tierIds);

      // Remove executed tasks
      for (const t of readyTier) {
        const idx = remaining.findIndex((r) => r.id === t.id);
        if (idx !== -1) remaining.splice(idx, 1);
      }
    }

    return { executionOrder, parallelGroups };
  }

  // ── Stage 5: Complexity Estimation ──────────────────────────────────

  private estimateComplexity(tasks: TaskNode[]): PlanComplexity {
    if (tasks.length <= 1) return "simple";
    if (tasks.length <= 3) return "moderate";
    return "complex";
  }

  // ── Stage 6: Clarification Manager ──────────────────────────────────

  private checkClarification(
    request: string,
    plannerCtx?: PlannerContext
  ): { needed: boolean; question?: string } {
    const lower = request.trim().toLowerCase();

    // If user says simply "create a chart" or "make chart" without any column context or range
    if (/^(create|make|add|draw) (a )?(chart|graph|plot)$/.test(lower)) {
      if (!plannerCtx?.headers || plannerCtx.headers.length === 0) {
        return {
          needed: true,
          question:
            "Which columns or data range would you like to use for the chart, and what chart type do you prefer (e.g. Bar, Line, Pie)?",
        };
      }
    }

    return { needed: false };
  }
}
