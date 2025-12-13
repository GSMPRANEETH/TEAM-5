"""Agent orchestrator.

Provides `run_agents(state)` which sequentially calls all agents in `/agents`
and returns a combined analysis dictionary.
"""

import json
from agents.communication_agent import communication_agent
from agents.confidence_agent import confidence_agent
from agents.personality_agent import personality_agent

# Import evaluation module
try:
    from evals import evaluate_agent, is_eval_available, refine_with_evaluations
    EVALS_AVAILABLE = True
except ImportError:
    EVALS_AVAILABLE = False
    def evaluate_agent(*args, **kwargs): return None
    def is_eval_available(): return False
    def refine_with_evaluations(*args, **kwargs): return {}


def run_agents(state, run_evals: bool = False, refine_outputs: bool = False):
    """Run communication, confidence, and personality agents in sequence.

    Args:
        state (dict): Pipeline output with `transcript` and `audio_features` keys.
        run_evals (bool): Whether to run LangChain evaluations on agent outputs.
        refine_outputs (bool): Whether to refine outputs based on evaluations.

    Returns:
        dict: Combined results with keys `communication_analysis`,
              `confidence_emotion_analysis`, and `personality_analysis`.
              If run_evals=True, also includes `_evaluations` key.
              If refine_outputs=True, also includes `_refinement_details` key.
    """
    try:
        evaluations = {} if run_evals and EVALS_AVAILABLE else None
        
        # Communication analysis (needs transcript + audio features)
        comm_res = communication_agent(state)
        comm = comm_res.get("communication_analysis") if isinstance(comm_res, dict) else None
        
        if evaluations is not None and comm:
            evaluations["communication"] = evaluate_agent(
                comm, "communication",
                {"transcript": state.get("transcript", "")[:200], 
                 "speech_rate": state.get("audio_features", {}).get("speech_rate")}
            )

        # Attach intermediate result for downstream agents
        state_with_comm = dict(state)
        if comm is not None:
            state_with_comm["communication_analysis"] = comm

        # Confidence & emotion analysis
        conf_res = confidence_agent(state_with_comm)
        conf = conf_res.get("confidence_emotion_analysis") if isinstance(conf_res, dict) else None
        
        if evaluations is not None and conf:
            evaluations["confidence"] = evaluate_agent(
                conf, "confidence",
                {"pitch_variance": state.get("audio_features", {}).get("pitch_variance"),
                 "energy_level": state.get("audio_features", {}).get("energy_level")}
            )

        # Attach confidence for personality agent
        state_with_comm_conf = dict(state_with_comm)
        if conf is not None:
            state_with_comm_conf["confidence_emotion_analysis"] = conf

        # Personality mapping
        person_res = personality_agent(state_with_comm_conf)
        person = person_res.get("personality_analysis") if isinstance(person_res, dict) else None
        
        if evaluations is not None and person:
            evaluations["personality"] = evaluate_agent(
                person, "personality",
                {"communication_analysis": comm, "confidence_analysis": conf}
            )

        combined = {}
        if comm is not None:
            combined["communication_analysis"] = comm
        else:
            combined["communication_analysis"] = comm_res

        if conf is not None:
            combined["confidence_emotion_analysis"] = conf
        else:
            combined["confidence_emotion_analysis"] = conf_res

        if person is not None:
            combined["personality_analysis"] = person
        else:
            combined["personality_analysis"] = person_res
        
        # Include evaluations if run
        if evaluations:
            combined["_evaluations"] = evaluations
        
        # Refine outputs if requested
        if refine_outputs and EVALS_AVAILABLE:
            input_context = {
                "transcript": state.get("transcript", ""),
                "audio_features": state.get("audio_features", {})
            }
            refinement_result = refine_with_evaluations(combined, input_context)
            
            # Update with refined outputs
            refined = refinement_result.get("refined_results", {})
            if "communication_analysis" in refined:
                combined["communication_analysis"] = refined["communication_analysis"]
            if "confidence_emotion_analysis" in refined:
                combined["confidence_emotion_analysis"] = refined["confidence_emotion_analysis"]
            if "personality_analysis" in refined:
                combined["personality_analysis"] = refined["personality_analysis"]
            
            combined["_refinement_details"] = refinement_result.get("refinement_details", {})

        return combined

    except Exception as e:
        return {
            "error": str(e),
            "status": "failed"
        }


if __name__ == "__main__":
    sample_state = {
        "transcript": "I am confident in my ability to communicate effectively.",
        "audio_features": {
            "speech_rate": 130,
            "pitch_variance": 22.5,
            "pause_ratio": 0.18,
            "energy_level": "medium-high"
        }
    }

    result = run_agents(sample_state)

    print("\n🧠 AGENT ORCHESTRATION OUTPUTS\n")
    print("📌 Communication Analysis")
    print(json.dumps(result.get("communication_analysis"), indent=2))

    print("\n📌 Confidence & Emotion Analysis")
    print(json.dumps(result.get("confidence_emotion_analysis"), indent=2))

    print("\n📌 Personality Mapping")
    print(json.dumps(result.get("personality_analysis"), indent=2))
