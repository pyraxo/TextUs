from app.models.scenario import Scenario
from app.schema.scenario import ScenarioCreateDto


async def get_scenarios():
    """Get all scenarios."""
    return await Scenario.find_all().to_list()


async def create_scenario(scenario_dto: ScenarioCreateDto) -> Scenario:
    """Create a new scenario."""
    scenario = Scenario(**scenario_dto.model_dump())
    return await scenario.insert()
