import {
  createMuiTheme,
  responsiveFontSizes,
  makeStyles,
} from '@material-ui/core/styles';

import { useTranslation } from '@digigov/ui/app/i18n';
import Title from '@digigov/ui/typography/Title';
import Container from '@material-ui/core/Container';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import MuiAppBar from '@material-ui/core/AppBar';

const useStyles = makeStyles((theme: any) => ({
  title: {
    lineHeight: '2em',
    marginBottom: 0,
    marginLeft: '5px',
    marginRight: theme.spacing(2),
  },
  appbar: {
    background: theme.palette.footer.main,
    color: theme.palette.footer.contrastText,
  },
  text: {
    flexGrow: 1,
  },
}));

const Logo = () => {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <div style={{ display: 'flex' }}>
      <img
        src={'/logo.png'}
        height={24}
        width={24}
        style={{ display: 'flex', marginTop: '6px' }}
      />
      <Title size="sm" className={styles.title}>
        {t('header_appbar.govgr_icon')}
      </Title>
    </div>
  );
};

export const Footer = () => {
  const styles = useStyles();
  return (
    <MuiAppBar className={styles.appbar} position="static">
      <Grid container>
        <Container>
          <Toolbar variant="dense" disableGutters>
            <Typography variant="body2" className={styles.text}>
              Powered by open source software
            </Typography>
          </Toolbar>
        </Container>
      </Grid>
    </MuiAppBar>
  );
};
let theme = createMuiTheme<any>({
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 0,
      },
    },
  },
  palette: {
    primary: {
      main: '#ebecef',
    },
    secondary: {
      main: '#ffffff',
      dark: '#f5f5f5',
    },
    footer: {
      main: '#ebecef',
      contrastText: '#000',
    },
  },
  typography: {
    htmlFontSize: 14,
  },
  header: {
    logo: {
      component: Logo,
      height: 45,
    },
    border: {
      width: '92%',
      height: '5px',
    },
    height: '45px',
  },
  footer: {
    component: Footer,
  },
});

theme = responsiveFontSizes(theme, ['sm', 'md', 'lg']);

export default theme;
