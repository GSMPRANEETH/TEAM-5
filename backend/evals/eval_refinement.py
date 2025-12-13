# evals/eval_refinement.py
"""
Evaluation-Driven Refinement System

Uses LangChain evaluations to iteratively refine agent outputs.
Implements feedback loops to improve quality based on pre-defined speech analysis criteria.
"""

import json
import logging
from typing import Any, Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from evals.eval_config import get_evaluator, SPEECH_ANALYSIS_CRITERIA
except ImportError:
    from eval_config import get_evaluator, SPEECH_ANALYSIS_CRITERIA


class RefinementManager:
    """
    Manages evaluation-driven refinement of agent outputs.
    Uses custom speech analysis criteria to improve outputs.
    """
    
    def __init__(self, llm=None, max_refinement_rounds: int = 2):
        """
        Initialize the refinement manager.
        
        Args:
            llm: LLM to use for refinement prompts
            max_refinement_rounds: Maximum number of refinement iterations
        """
        self.evaluator = get_evaluator(llm)
        self.max_rounds = max_refinement_rounds
        self._llm = llm
    
    def _get_llm(self):
        """Get the LLM for refinement."""
        if self._llm is not None:
            return self._llm
        
        try:
            from llm1.local_llm import get_llm
            return get_llm()
        except Exception as e:
            logger.warning(f"Could not load LLM for refinement: {e}")
            return None
    
    def refine_output(
        self,
        output: Dict[str, Any],
        output_type: str,
        input_context: Dict[str, Any],
        feedback: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Refine an output based on evaluation feedback.
        
        Args:
            output: The output to refine
            output_type: Type of output ('communication', 'confidence', 'personality', 'report')
            input_context: Input context that generated the output
            feedback: Optional explicit feedback for refinement
            
        Returns:
            Refined output and refinement details
        """
        llm = self._get_llm()
        if llm is None:
            return {
                "error": "No LLM available for refinement",
                "refined_output": output,
                "refinement_rounds": 0
            }
        
        refinement_history = []
        current_output = output
        
        for round_num in range(self.max_rounds):
            # Evaluate current output
            if output_type == "report":
                eval_results = self.evaluator.evaluate_final_report(
                    str(current_output) if not isinstance(current_output, str) else current_output,
                    input_context
                )
            else:
                eval_results = self.evaluator.evaluate_agent_output(
                    current_output, output_type, input_context
                )
            
            weak_areas = eval_results.get("weak_areas", [])
            overall_score = eval_results.get("overall_score") or eval_results.get("average_criteria_score", 0)
            
            # If already meets criteria (score >= 0.75 or no weak areas), stop
            if (overall_score and overall_score >= 0.75) or not weak_areas:
                refinement_history.append({
                    "round": round_num + 1,
                    "status": "converged",
                    "overall_score": overall_score,
                    "weak_areas_remaining": 0
                })
                break
            
            # Build refinement prompt
            refinement_feedback = self.evaluator.get_refinement_feedback(eval_results)
            if feedback:
                refinement_feedback += f"\n\nAdditional feedback: {feedback}"
            
            refinement_prompt = self._build_refinement_prompt(
                current_output, output_type, input_context, refinement_feedback
            )
            
            try:
                # Call LLM to refine output
                refined_str = llm.invoke(refinement_prompt)
                
                # Parse refined output
                from utils.parser import safe_parse
                current_output = safe_parse(refined_str)
                
                refinement_history.append({
                    "round": round_num + 1,
                    "status": "refined",
                    "previous_score": overall_score,
                    "weak_areas_addressed": [w["criterion"] for w in weak_areas]
                })
                
                logger.info(f"✅ Refinement round {round_num + 1} completed")
                
            except Exception as e:
                logger.error(f"Refinement round {round_num + 1} failed: {e}")
                refinement_history.append({
                    "round": round_num + 1,
                    "status": "failed",
                    "error": str(e)
                })
                break
        
        # Final evaluation
        if output_type == "report":
            final_eval = self.evaluator.evaluate_final_report(
                str(current_output) if not isinstance(current_output, str) else current_output,
                input_context
            )
        else:
            final_eval = self.evaluator.evaluate_agent_output(
                current_output, output_type, input_context
            )
        
        return {
            "original_output": output,
            "refined_output": current_output,
            "refinement_history": refinement_history,
            "total_rounds": len(refinement_history),
            "final_evaluation": final_eval
        }
    
    def _build_refinement_prompt(
        self,
        current_output: Dict[str, Any],
        output_type: str,
        input_context: Dict[str, Any],
        feedback: str
    ) -> str:
        """Build a prompt to refine the output."""
        output_str = json.dumps(current_output, indent=2) if isinstance(current_output, dict) else str(current_output)
        
        prompt = f"""You are refining a speech analysis output to meet quality criteria.

CURRENT OUTPUT:
{output_str}

ANALYSIS TYPE: {output_type}

INPUT CONTEXT:
{json.dumps(input_context)[:800]}

FEEDBACK TO ADDRESS:
{feedback}

QUALITY CRITERIA:
{chr(10).join([f"- {name}: {desc}" for name, desc in SPEECH_ANALYSIS_CRITERIA.items()])}

TASK: Refine the output to address the feedback while maintaining accuracy.
Return ONLY the refined JSON output matching the original structure. No explanation."""
        
        return prompt
    
    def refine_agent_outputs(
        self,
        agent_results: Dict[str, Any],
        input_context: Dict[str, Any],
        refine_agents: list = None
    ) -> Dict[str, Any]:
        """
        Refine multiple agent outputs.
        
        Args:
            agent_results: Results from all agents
            input_context: Input context (transcript, audio_features)
            refine_agents: List of agents to refine (default: all)
            
        Returns:
            Refined agent results with details
        """
        if refine_agents is None:
            refine_agents = ["communication", "confidence", "personality"]
        
        # Map agent names to output keys
        agent_key_map = {
            "communication": "communication_analysis",
            "confidence": "confidence_emotion_analysis",
            "personality": "personality_analysis"
        }
        
        refined_results = dict(agent_results)  # Copy original
        refinement_details = {}
        
        for agent_name in refine_agents:
            output_key = agent_key_map.get(agent_name, f"{agent_name}_analysis")
            if output_key not in agent_results:
                continue
            
            output = agent_results[output_key]
            
            # Skip if already an error
            if isinstance(output, dict) and output.get("error"):
                refined_results[output_key] = output
                continue
            
            logger.info(f"🔄 Refining {agent_name} output...")
            
            refinement = self.refine_output(output, agent_name, input_context)
            
            refined_results[output_key] = refinement["refined_output"]
            
            # Calculate improvement
            original_score = self.evaluator.evaluate_agent_output(
                output, agent_name, input_context
            ).get("overall_score", 0) or 0
            final_score = refinement["final_evaluation"].get("overall_score", 0) or 0
            
            refinement_details[agent_name] = {
                "rounds": refinement["total_rounds"],
                "original_score": original_score,
                "final_score": final_score,
                "improvement": final_score - original_score,
                "history": refinement["refinement_history"]
            }
            
            logger.info(f"✅ {agent_name}: {original_score:.2f} → {final_score:.2f} in {refinement['total_rounds']} round(s)")
        
        return {
            "refined_results": refined_results,
            "refinement_details": refinement_details
        }


# Singleton instance
_refinement_manager = None


def get_refinement_manager(llm=None) -> RefinementManager:
    """Get the singleton refinement manager."""
    global _refinement_manager
    if _refinement_manager is None:
        _refinement_manager = RefinementManager(llm=llm)
    return _refinement_manager


def refine_with_evaluations(
    agent_results: Dict[str, Any],
    input_context: Dict[str, Any],
    refine_agents: list = None
) -> Dict[str, Any]:
    """
    Convenience function to refine agent outputs using evaluations.
    
    Args:
        agent_results: Results from agents
        input_context: Input context (transcript, audio_features)
        refine_agents: Which agents to refine (default: all)
        
    Returns:
        Refined results with compliance scores
    """
    manager = get_refinement_manager()
    return manager.refine_agent_outputs(agent_results, input_context, refine_agents)
