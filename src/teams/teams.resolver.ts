import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { AuthPipe } from './pipe/auth.pipe';
import { UseGuards, UsePipes } from '@nestjs/common';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';
import { CredentialsService } from 'src/credentials/credentials.service';
import { ManyTeamInput } from './dto/many-team.input';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(private readonly teamsService: TeamsService,
    private readonly credentialsService: CredentialsService,) {}

  @UsePipes(AuthPipe)
  @Mutation(() => Team)
  @HasRoles(Roles.Admin , Roles.Controller)
  @UseGuards(RolesGuard)
  createTeam(@Args('createTeamInput') createTeamInput: CreateTeamInput) {
    return this.teamsService.create(createTeamInput);
  }

  @Mutation(() => [Team])
  @HasRoles(Roles.Admin , Roles.Controller)
  @UseGuards(RolesGuard)
  createManyTeam(@Args('createTeamInput') createTeamInput: ManyTeamInput) {
    return this.teamsService.createMany(createTeamInput.inputs);
  }

  @Query(() => [Team], { name: 'teams' })
  async findAll(@Info() info: any, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields  = Object.keys(fieldsProjection(info));
    return this.teamsService.findAll(fields);
  }

  // update many teams
  @Mutation(() => [Team])
  @HasRoles(Roles.Admin , Roles.Controller)
  @UseGuards(RolesGuard)
  updateManyTeam(@Args('updateTeamInput' ,  { type: () => [UpdateTeamInput] }) updateTeamInput: UpdateTeamInput[]) {
    return this.teamsService.updateMany(updateTeamInput);
  }

  @Query(() => Team, { name: 'team' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields  = Object.keys(fieldsProjection(info));
    return this.teamsService.findOne(id, fields );
  }

  @Mutation(() => Team)
  @HasRoles(Roles.Admin , Roles.Controller)
  @UseGuards(RolesGuard)
  updateTeam(@Args('updateTeamInput') updateTeamInput: UpdateTeamInput) {
    return this.teamsService.update(updateTeamInput.id, updateTeamInput);
  }

  @Mutation(() => Team)
  @HasRoles(Roles.Admin , Roles.Controller)
  @UseGuards(RolesGuard)
  removeTeam(@Args('id', { type: () => Int }) id: number) {
    return this.teamsService.remove(id);
  }
}
