from app.models.scenario import Scenario


async def get_scenarios():
    return await Scenario.find_all().to_list()


async def create_scenario(scenario: Scenario) -> Scenario:
    return await scenario.insert()
