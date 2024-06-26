import { ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { IllustrationHeroSectionComponent } from './components/illustration-hero-section/illustration-hero-section.component';
import { WhyChooseSectionComponent } from './components/why-choose-section/why-choose-section.component';
import { FeatureSectionComponent } from './components/feature-section/feature-section.component';
import { FeatureInfoComponent } from './dialogs/feature-info/feature-info.component';
import { CovidSectionComponent } from './components/covid-section/covid-section.component';
import { CommunityNumbersSectionComponent } from './components/community-numbers-section/community-numbers-section.component';
import { MaterialModule } from './material.module';
import { FiltersLgComponent } from './components/filters-lg/filters-lg.component';
import { FiltersSmComponent } from './components/filters-sm/filters-sm.component';
import { FilterDialogComponent } from './dialogs/filter-dialog/filter-dialog.component';
import { CardElevateDirective } from './directives/card-elevate.directive';
import { StickyNavDirective } from './directives/sticky-nav.directive';
import { CardLoadingShimmerComponent } from './components/card-loading-shimmer/card-loading-shimmer.component';
import { NoItemsMessageComponent } from './components/no-items-message/no-items-message.component';
import { FixtureBasicComponent } from './components/fixture-basic/fixture-basic.component';
import { BarLoadingShimmerComponent } from './components/bar-loading-shimmer/bar-loading-shimmer.component';
import { MatchCardComponent } from './dialogs/match-card/match-card.component';
import { TeamCommsMobileComponent } from './components/team-comms-mobile/team-comms-mobile.component';
import { UpdateInfoComponent } from './components/update-info/update-info.component';
import { ContestMobileComponent } from './components/contest-mobile/contest-mobile.component';
import { JourneyMobileComponent } from './components/journey-mobile/journey-mobile.component';
import { TrickBoxComponent } from './components/trick-box/trick-box.component';
import { ExitDashboardComponent } from './components/exit-dashboard/exit-dashboard.component';
import { NamePositionComboPipe } from './pipes/name-position-combo.pipe';
import { NameComboPipe } from './pipes/name-combo.pipe';
import { LoadingComponent } from './components/loading/loading.component';
import { PlayerCardComponent } from './dialogs/player-card/player-card.component';
import { MatchDetailHeaderComponent } from './components/match-detail-header/match-detail-header.component';
import { TickAnimationComponent } from './components/tick-animation/tick-animation.component';
import { TextShortenPipe } from './pipes/text-shorten.pipe';
import { SocialMediaLinksComponent } from './components/social-media-links/social-media-links.component';
import { EnlargeMediaComponent } from './dialogs/enlarge-media/enlarge-media.component';
import { AboutProfileCardComponent } from './components/about-profile-card/about-profile-card.component';
import { SharesheetmobileComponent } from './components/sharesheetmobile/sharesheetmobile.component';
import { SharesheetComponent } from './components/sharesheet/sharesheet.component';
import { WeightPipe } from './pipes/weight.pipe';
import { StrongFootPipe } from './pipes/strong-foot.pipe';
import { HeightPipe } from './pipes/height.pipe';
import { GenderPipe } from './pipes/gender.pipe';
import { ContactNumberPipe } from './pipes/contact-number.pipe';
import { JerseyPipe } from './pipes/jersey.pipe';
import { BioPipe } from './pipes/bio.pipe';
import { ProfilePicPipe } from './pipes/profile-pic.pipe';
import { ConfirmationBoxComponent } from './dialogs/confirmation-box/confirmation-box.component';
import { LeaveRouteBoxComponent } from './dialogs/leave-route-box/leave-route-box.component';
import { SearchLgComponent } from './components/search-lg/search-lg.component';
import { FilterListPipe } from './pipes/filter-list.pipe';
import { AccountAvatarComponent } from './components/account-avatar/account-avatar.component';
import { SearchAutocompleteComponent } from './components/search-autocomplete/search-autocomplete.component';
import {
  IllustrationHeroSectionAlternateComponent
} from './components/illustration-hero-section-alternate/illustration-hero-section-alternate.component';
import { PhotoUploaderComponent } from './components/photo-uploader/photo-uploader.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { HourToDate } from './pipes/hour-to-date.pipe';
import { ActionStripComponent } from './components/action-strip/action-strip.component';
import { PlStandingsComponent } from '@app/play/pl-standings/pl-standings.component';
import { PlStLeagueComponent } from '@app/play/pl-standings/pl-st-league/pl-st-league.component';
import { environment } from 'environments/environment';
import { ShareButtonsConfig, ShareModule } from 'ngx-sharebuttons';
import { FallbackImgDirective } from '@shared/directives/fallback-img.directive';
import { RouterModule } from '@angular/router';
import { SocialGroupComponent } from './dialogs/social-group/social-group.component';
import { ViewGroundCardComponent } from './dialogs/view-ground-card/view-ground-card.component';
import { PaymentOptionsDialogComponent } from './dialogs/payment-options-dialog/payment-options-dialog.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { SearchableFormFieldComponent } from '@shared/components/searchable-form-field/searchable-form-field.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TeamPlayerMembersListComponent } from '@shared/components/team-player-members-list/team-player-members-list.component';
import { ActionShortcutButtonComponent } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { UserQuestionsCommunicationComponent } from '@shared/dialogs/user-questions-communication/user-questions-communication.component';
import { TeamChatThreadComponent } from './dialogs/team-chat-thread/team-chat-thread.component';
import { OverlayButtonsComponent } from './components/overlay-buttons/overlay-buttons.component';
import { SeasonParticipateCardComponent } from './components/season-participate-card/season-participate-card.component';
import { TeamsListComponent } from './components/teams-list/teams-list.component';
import { FixturesResultsTabsComponent } from './components/fixtures-results-tabs/fixtures-results-tabs.component';
import { StandingsTabsComponent } from './components/standings-tabs/standings-tabs.component';
import { KnockoutBracketComponent } from './components/knockout-bracket/knockout-bracket.component';
import { MyStatsCardComponent } from '@app/dashboard/dash-home/my-stats-card/my-stats-card.component';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { SubmitMatchRequestComponent } from '@app/main-shell/components/submit-match-request/submit-match-request.component';

const customConfig: ShareButtonsConfig = environment.socialShare;

@NgModule({
  declarations: [
    HeroSectionComponent,
    IllustrationHeroSectionComponent,
    WhyChooseSectionComponent,
    LeaveRouteBoxComponent,
    FeatureSectionComponent,
    FeatureInfoComponent,
    CovidSectionComponent,
    CommunityNumbersSectionComponent,
    FiltersLgComponent,
    FiltersSmComponent,
    FilterDialogComponent,
    CardElevateDirective,
    StickyNavDirective,
    CardLoadingShimmerComponent,
    NoItemsMessageComponent,
    FixtureBasicComponent,
    BarLoadingShimmerComponent,
    MatchCardComponent,
    TeamCommsMobileComponent,
    UpdateInfoComponent,
    ContestMobileComponent,
    JourneyMobileComponent,
    TrickBoxComponent,
    ExitDashboardComponent,
    NamePositionComboPipe,
    NameComboPipe,
    LoadingComponent,
    PlayerCardComponent,
    MatchDetailHeaderComponent,
    TickAnimationComponent,
    TextShortenPipe,
    SocialMediaLinksComponent,
    EnlargeMediaComponent,
    AboutProfileCardComponent,
    SharesheetmobileComponent,
    SharesheetComponent,
    WeightPipe,
    StrongFootPipe,
    HeightPipe,
    GenderPipe,
    ContactNumberPipe,
    JerseyPipe,
    BioPipe,
    ProfilePicPipe,
    ConfirmationBoxComponent,
    SearchLgComponent,
    FilterListPipe,
    AccountAvatarComponent,
    IllustrationHeroSectionAlternateComponent,
    SearchAutocompleteComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    HourToDate,
    ActionStripComponent,
    PlStandingsComponent,
    PlStLeagueComponent,
    FallbackImgDirective,
    SocialGroupComponent,
    ViewGroundCardComponent,
    PaymentOptionsDialogComponent,
    PlayersListComponent,
    SearchableFormFieldComponent,
    TeamPlayerMembersListComponent,
    ActionShortcutButtonComponent,
    UserQuestionsCommunicationComponent,
    TeamChatThreadComponent,
    OverlayButtonsComponent,
    SeasonParticipateCardComponent,
    TeamsListComponent,
    FixturesResultsTabsComponent,
    StandingsTabsComponent,
    KnockoutBracketComponent,
    MyStatsCardComponent,
    LiveSeasonComponent,
    SubmitMatchRequestComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    YouTubePlayerModule,
    ClipboardModule,
    RouterModule,
    NgxMatSelectSearchModule,
    ShareModule.withConfig(customConfig),
  ],
  exports: [
    HeroSectionComponent,
    IllustrationHeroSectionComponent,
    WhyChooseSectionComponent,
    FeatureSectionComponent,
    FeatureInfoComponent,
    CovidSectionComponent,
    CommunityNumbersSectionComponent,
    FiltersLgComponent,
    FiltersSmComponent,
    FilterDialogComponent,
    CardElevateDirective,
    StickyNavDirective,
    CardLoadingShimmerComponent,
    NoItemsMessageComponent,
    FixtureBasicComponent,
    BarLoadingShimmerComponent,
    MatchCardComponent,
    TeamCommsMobileComponent,
    UpdateInfoComponent,
    ContestMobileComponent,
    JourneyMobileComponent,
    TrickBoxComponent,
    ExitDashboardComponent,
    NamePositionComboPipe,
    NameComboPipe,
    LoadingComponent,
    PlayerCardComponent,
    MatchDetailHeaderComponent,
    TickAnimationComponent,
    TextShortenPipe,
    SocialMediaLinksComponent,
    EnlargeMediaComponent,
    AboutProfileCardComponent,
    SharesheetmobileComponent,
    SharesheetComponent,
    WeightPipe,
    StrongFootPipe,
    HeightPipe,
    GenderPipe,
    ContactNumberPipe,
    JerseyPipe,
    BioPipe,
    ProfilePicPipe,
    ConfirmationBoxComponent,
    SearchLgComponent,
    FilterListPipe,
    AccountAvatarComponent,
    IllustrationHeroSectionAlternateComponent,
    SearchAutocompleteComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    HourToDate,
    ActionStripComponent,
    PlStandingsComponent,
    PlStLeagueComponent,
    FallbackImgDirective,
    SocialGroupComponent,
    ViewGroundCardComponent,
    PaymentOptionsDialogComponent,
    PlayersListComponent,
    SearchableFormFieldComponent,
    TeamPlayerMembersListComponent,
    ActionShortcutButtonComponent,
    UserQuestionsCommunicationComponent,
    TeamChatThreadComponent,
    OverlayButtonsComponent,
    SeasonParticipateCardComponent,
    TeamsListComponent,
    FixturesResultsTabsComponent,
    StandingsTabsComponent,
    KnockoutBracketComponent,
    MyStatsCardComponent,
    LiveSeasonComponent,
    SubmitMatchRequestComponent,
    LeaveRouteBoxComponent
  ],
})
export class SharedModule { }
