# evals/__init__.py
"""
LangChain-based Evaluation Module for Speech Analysis Pipeline

This module provides evaluation capabilities using LangChain's built-in evaluators:
- CriteriaEvalChain for criteria-based evaluation (helpfulness, relevance, coherence, etc.)
- ScoreStringEvalChain for 1-10 scoring
- JsonValidityEvaluator for JSON validation
- Custom Speech Analysis Criteria (actionability, specificity, accuracy, etc.)

Usage:
    from evals import evaluate_agent, evaluate_report, run_full_evaluation
    
    # Evaluate a single agent
    result = evaluate_agent(agent_output, "communication", input_metrics)
    
    # Evaluate the final report
    result = evaluate_report(report, agent_outputs)
    
    # Run full pipeline evaluation
    results = run_full_evaluation(pipeline_output)
    
    # Refine outputs based on evaluations
    refined = refine_with_evaluations(agent_results, input_context)
"""

from evals.eval_config import (
    SpeechAnalysisEvaluator,
    get_evaluator,
    evaluate_agent,
    evaluate_report,
    is_eval_available,
    EvalCriteria,
    SPEECH_ANALYSIS_CRITERIA,
)

from evals.eval_runner import (
    run_full_evaluation,
    run_batch_evaluation,
    EvaluationRunner,
)

from evals.eval_refinement import (
    RefinementManager,
    get_refinement_manager,
    refine_with_evaluations,
)

__all__ = [
    # Main evaluator class
    "SpeechAnalysisEvaluator",
    "get_evaluator",
    
    # Convenience functions
    "evaluate_agent",
    "evaluate_report",
    "run_full_evaluation",
    "run_batch_evaluation",
    
    # Refinement
    "RefinementManager",
    "get_refinement_manager",
    "refine_with_evaluations",
    
    # Runner class
    "EvaluationRunner",
    
    # Configuration
    "EvalCriteria",
    "SPEECH_ANALYSIS_CRITERIA",
    "is_eval_available",
]
