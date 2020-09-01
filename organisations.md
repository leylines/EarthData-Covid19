---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: page
title: Organisationen
permalink: /organisations/
---

## Seiten
<div>
{% if site.data.navlist.toc[0] %}
  {% for item in site.data.navlist.toc %}
    {% if item.title == "Organisationen" %}
      <h3>{{ item.title }}</h3>
      {% if item.subfolderitems[0] %}
        <ul>
        {% for entry in item.subfolderitems %}
          <li><a href="{{ entry.url }}">{{ entry.page }}</a>
          {% if entry.subsubfolderitems[0] %}
            <ul>
            {% for subentry in entry.subsubfolderitems %}
              <li><a href="{{ subentry.url }}">{{ subentry.page }}</a></li>
            {% endfor %}
            </ul>
          {% endif %}
          </li>
        {% endfor %}
        </ul>
      {% endif %}
    {% endif %}
  {% endfor %}
{% endif %}
</div>

# Recht

## <img src="{{site.baseurl}}/assets/img/flaggen/ch.png"> WirKlagenAn
<i class="fas fa-globe"></i> [wirklagenan.org](https://wirklagenan.org/)  

## <img src="{{site.baseurl}}/assets/img/flaggen/de.png"> Corona-Ausschuss
<i class="fas fa-globe"></i> [corona-ausschuss.de](https://corona-ausschuss.de/)  
<i class="fab fa-telegram"></i> [Corona_Ausschuss](https://t.me/Corona_Ausschuss)  

## <img src="{{site.baseurl}}/assets/img/flaggen/de.png"> klagePATEN
<i class="fas fa-globe"></i> [klagepaten.eu](https://klagepaten.eu/)  

## Corona-Transition
<i class="fas fa-globe"></i> [corona-transition.org](https://corona-transition.org)  
<i class="fab fa-telegram"></i> [CoronaTransition](https://t.me/CoronaTransition)  

## Demokratischer Widerstand
<i class="fas fa-globe"></i> [demokratischerwiderstand.de](https://demokratischerwiderstand.de/)  

# Gesundheit

## Ärzte für Aufklärung
<i class="fas fa-globe"></i> [www.ärzte-für-aufklärung.de](https://www.ärzte-für-aufklärung.de/)  

## RPP-Institut

Das Institut für Religiosität in Psychiatrie und Psychotherapie ist 2009 aus der gleichnamigen, 2007 in Graz gestarteten Kongressreihe hervorgegangen und dessen Rechtsnachfolger. Die Gründer sind der Psychiater Raphael M. Bonelli, der Psychotherapeut Walter Pieringer und der Theologe Bernd Oberndorfer. Der Sitz des Institutes ist Wien.

<i class="fas fa-globe"></i> [rpp-institut.org](https://rpp-institut.org/)  
<i class="fab fa-youtube"></i> [rppinstitut](https://www.youtube.com/user/rppinstitut)  
<i class="fab fa-telegram"></i> [rppinstitut](https://t.me/rppinstitut)  

# Whistleblower 

## Mutigmacher e.V.
<i class="fas fa-globe"></i> [mutigmacher.org](https://mutigmacher.org/)  

## Kritische Polizisten
<i class="fas fa-globe"></i> [www.kritische-polizisten.de](https://www.kritische-polizisten.de/)  

