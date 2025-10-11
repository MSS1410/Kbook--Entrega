import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import {
  FaApple,
  FaGooglePlay,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal
} from 'react-icons/fa'
import { SiTiktok } from 'react-icons/si'

const Wrap = styled.footer`
  background: rgb(80, 24, 133); /* oscuro */
  color: #e8e8ea;
  margin-top: 48px;
`

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  display: grid;
  row-gap: 28px;
`

/*  ROW 1 descargas  */
const Row1 = styled.div`
  display: grid;
  grid-template-columns: 1fr minmax(280px, 540px) 1fr;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`

const StoreButtons = styled.div`
  grid-column: 2;
  display: inline-flex;
  gap: 10px;
  justify-content: center;

  @media (max-width: 640px) {
    grid-column: 1;
  }
`

const StoreBtn = styled.button`
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: #12161f;
  color: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
    background: #171c27;
  }

  & svg {
    flex-shrink: 0;
    font-size: 1.25rem;
  }
`

const StoreText = styled.span`
  display: grid;
  line-height: 1.05;
  text-align: left;
  font-weight: 700;
  font-size: 0.9rem;
`

/*  ROW 2 COLumnas*/
const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr 1.2fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Col = styled.div``

// columna 2 y 3 centradas
const ColCenter = styled(Col)`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
`

const TrustpilotBadge = styled.div`
  display: grid;
  gap: 10px;
`

const TrustHeader = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1rem;
`

const TrustStar = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: #00b67a;
  display: inline-block;
`

const StarsRow = styled.div`
  display: inline-flex;
  gap: 6px;
  & > span {
    width: 22px;
    height: 22px;
    background: #00b67a;
    clip-path: polygon(
      50% 0%,
      61% 35%,
      98% 35%,
      68% 57%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 57%,
      2% 35%,
      39% 35%
    );
    display: inline-block;
  }
`

const ClimateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #86e0c6;

  &::before {
    content: '';
    width: 24px;
    height: 24px;
    background: radial-gradient(circle at 30% 30%, #58c197, #0a5d3a);
    border-radius: 50%;
    display: inline-block;
  }
`

const ListTitle = styled.h4`
  margin: 8px 0 10px;
  font-size: 1rem;
`

const LinksList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  ${({ $center }) => $center && 'place-items: center;'}
`

const FooterLink = styled(Link)`
  text-decoration: none;
  color: #e8e8ea;
  font-size: 0.95rem;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const SocialRow = styled.div`
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;

  & a {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: #12161f;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #e8e8ea;
    text-decoration: none;
    transition: transform 0.12s ease, box-shadow 0.12s ease,
      background 0.12s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
      background: #171c27;
    }
  }
`

const PayRow = styled.div`
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;

  & span {
    width: 48px;
    height: 32px;
    border-radius: 8px;
    background: #12161f;
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: grid;
    place-items: center;
    font-size: 1.35rem;
    color: #e8e8ea;
  }
`

/*  ROW 3 dividir y centrar bottom   */
const Row3 = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto 1fr; /* left links | copy | right links */
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.12);

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    text-align: center;
    row-gap: 10px;
  }
`

const Copy = styled.div`
  font-size: 0.9rem;
  color: #b9b9bf;

  @media (min-width: 801px) {
    grid-column: 3; /* centro */
  }
`

const BottomLinks = styled.div`
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;

  & a {
    text-decoration: none;
    font-size: 0.9rem;
    color: #e8e8ea;
  }

  & a:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (min-width: 801px) {
    &:first-of-type {
      grid-column: 2;
      justify-self: end;
    }
    &:last-of-type {
      grid-column: 4;
      justify-self: start;
    }
  }

  @media (max-width: 800px) {
    justify-content: center;
  }
`
// footer responsive con 3 filas : descargas, info/pagos, bottom
export default function Footer() {
  // como los enlaces seran "fake", prevenimos la recarga del page ante el click
  const avoidNav = (e) => e.preventDefault()

  return (
    <Wrap>
      <Inner>
        {/*  Row 1  */}
        <Row1>
          <div />
          <StoreButtons>
            <StoreBtn onClick={avoidNav} aria-label='Descargar en App Store'>
              <FaApple />
              <StoreText>Descargar en App Store</StoreText>
            </StoreBtn>
            {/* todos los links como placeholder */}
            <StoreBtn onClick={avoidNav} aria-label='Descargar en Google Play'>
              <FaGooglePlay />
              <StoreText>Descargar en Google Play</StoreText>
            </StoreBtn>
          </StoreButtons>
          <div />
        </Row1>

        {/* Row 2  */}
        <Row2>
          {/* Col 1 Trustpilot y cambio climatico fake*/}
          <Col>
            <Card aria-label='Trustpilot (falso)'>
              <TrustpilotBadge>
                <TrustHeader>
                  <TrustStar />
                  Trustpilot
                </TrustHeader>
                <StarsRow aria-hidden='true'>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </StarsRow>
                <div style={{ fontSize: '0.9rem', color: '#b9b9bf' }}>
                  Puntuación 5.0 · 2.1k opiniones
                </div>
              </TrustpilotBadge>
            </Card>

            <Card aria-label='Certificación medioambiental (falso)'>
              <ClimateBadge>Climate Neutral Certified</ClimateBadge>
              <div
                style={{ fontSize: '0.9rem', color: '#cfd3da', marginTop: 8 }}
              >
                Compensamos emisiones y apoyamos proyectos de reforestación.
              </div>
            </Card>
          </Col>

          {/* Col 2 enlaces center */}
          <ColCenter>
            <ListTitle>Información</ListTitle>
            <LinksList $center>
              <li>
                <FooterLink to='#'>Conoce más de nosotros</FooterLink>
              </li>
              <li>
                <FooterLink to='#'>Contacte con KBook Store</FooterLink>
              </li>
              <li>
                <FooterLink to='#'>KBook FAQ</FooterLink>
              </li>
              <li>
                <FooterLink to='#'>Retornos y Reembolsos</FooterLink>
              </li>
              <li>
                <FooterLink to='#'>Nuestras tiendas</FooterLink>
              </li>
            </LinksList>
          </ColCenter>

          {/* Col 3 redes y pago fake  */}
          <ColCenter>
            <ListTitle>Síguenos</ListTitle>
            <SocialRow>
              <a href='#' aria-label='Facebook'>
                <FaFacebook />
              </a>
              <a href='#' aria-label='Instagram'>
                <FaInstagram />
              </a>
              <a href='#' aria-label='Twitter / X'>
                <FaTwitter />
              </a>
              <a href='#' aria-label='TikTok'>
                <SiTiktok />
              </a>
            </SocialRow>

            <ListTitle style={{ marginTop: 18 }}>Métodos de pago</ListTitle>
            <PayRow aria-label='Métodos de pago aceptados'>
              <span title='Visa'>
                <FaCcVisa />
              </span>
              <span title='Mastercard'>
                <FaCcMastercard />
              </span>
              <span title='American Express'>
                <FaCcAmex />
              </span>
              <span title='PayPal'>
                <FaCcPaypal />
              </span>
            </PayRow>
          </ColCenter>
        </Row2>

        {/*  Row 3 bottom center / 2  */}
        <Row3>
          <BottomLinks>
            <Link to='#'>Términos de Uso</Link>
          </BottomLinks>

          <Copy>© 2025 KBook Store — Todos los derechos reservados.</Copy>

          <BottomLinks>
            <Link to='#'>Términos de Uso Digital</Link>
            <Link to='#'>Privacidad</Link>
          </BottomLinks>
        </Row3>
      </Inner>
    </Wrap>
  )
}
